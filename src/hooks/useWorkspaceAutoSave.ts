import { useState, useEffect, useRef, useCallback } from 'react';
import { AutoSaveSceneState, AutoSaveStatus, ProceduralSpec, SimulationType, ChatMessage } from '../types';
import { workspaceAutosaveService, AutoSaveSyncResult } from '../services/workspaceAutosaveService';

interface UseWorkspaceAutoSaveProps {
  proceduralSpec?: ProceduralSpec | null;
  currentDesign?: any;
  dimensions: { length: number; width: number; height: number };
  selectedMaterial: { id: string; name: string; color?: string };
  simulationMode: SimulationType;
  isBiomorphic: boolean;
  prompt: string;
  historyNodes?: any[];
  chatHistory?: ChatMessage[];
  token?: string | null;
  userEmail?: string | null;
  hasModel: boolean;
  intervalSeconds?: number;
  onRestoreState?: (state: AutoSaveSceneState) => void;
}

export function useWorkspaceAutoSave({
  proceduralSpec,
  currentDesign,
  dimensions,
  selectedMaterial,
  simulationMode,
  isBiomorphic,
  prompt,
  historyNodes = [],
  chatHistory = [],
  token,
  userEmail,
  hasModel,
  intervalSeconds: propIntervalSeconds = 30,
  onRestoreState
}: UseWorkspaceAutoSaveProps) {
  const [status, setStatus] = useState<AutoSaveStatus>('synced');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>('Not saved yet');
  const [intervalSeconds, setIntervalSeconds] = useState<number>(propIntervalSeconds);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [lastRevisionId, setLastRevisionId] = useState<string | null>(null);
  const [versionNumber, setVersionNumber] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Recovery State
  const [hasRecoverableSession, setHasRecoverableSession] = useState(false);
  const [recoverableSnapshot, setRecoverableSnapshot] = useState<AutoSaveSceneState | null>(null);
  const [recoverableSource, setRecoverableSource] = useState<'backend' | 'cloud' | 'local' | 'none'>('none');

  // Track state signature
  const lastSyncedSignatureRef = useRef<string>('');
  const latestStateRef = useRef<AutoSaveSceneState | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const periodicTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (status === 'offline') setStatus('dirty');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [status]);

  // Construct current snapshot
  const getCurrentState = useCallback((): AutoSaveSceneState => {
    return {
      geometry: proceduralSpec || currentDesign?.proceduralSpec || null,
      parameters: {
        dimensions: { ...dimensions },
        material: {
          id: selectedMaterial.id,
          name: selectedMaterial.name,
          color: selectedMaterial.color
        },
        simulationMode,
        isBiomorphic,
        prompt: prompt || ''
      },
      design: currentDesign || null,
      historyNodes: historyNodes || [],
      chatHistory: chatHistory || [],
      timestamp: new Date().toISOString(),
      version: versionNumber
    };
  }, [
    proceduralSpec,
    currentDesign,
    dimensions,
    selectedMaterial,
    simulationMode,
    isBiomorphic,
    prompt,
    historyNodes,
    chatHistory,
    versionNumber
  ]);

  // Keep latestStateRef updated
  useEffect(() => {
    latestStateRef.current = getCurrentState();
  }, [getCurrentState]);

  // Generate deterministic signature of current geometric and parametric configuration
  const computeStateSignature = useCallback(() => {
    const geomStr = proceduralSpec ? JSON.stringify(proceduralSpec) : (currentDesign?.proceduralSpec ? JSON.stringify(currentDesign.proceduralSpec) : '');
    const paramStr = `${dimensions.length}_${dimensions.width}_${dimensions.height}_${selectedMaterial.id}_${simulationMode}_${isBiomorphic}_${prompt}`;
    const histLen = historyNodes.length;
    return `${geomStr}::${paramStr}::${histLen}`;
  }, [proceduralSpec, currentDesign, dimensions, selectedMaterial, simulationMode, isBiomorphic, prompt, historyNodes]);

  // Perform backend sync
  const performSync = useCallback(async (changeType: string = 'periodic_sync') => {
    if (!isEnabled || isSavingRef.current) return;

    const currentState = latestStateRef.current || getCurrentState();
    const currentSignature = computeStateSignature();

    // Check if there is actual content or parameters to sync
    const hasMeaningfulContent = hasModel || !!proceduralSpec || !!currentDesign || prompt.trim().length > 0 || historyNodes.length > 0;
    if (!hasMeaningfulContent) return;

    isSavingRef.current = true;
    setStatus('saving');

    try {
      const result: AutoSaveSyncResult = await workspaceAutosaveService.syncSceneStateToBackend(currentState, {
        token,
        userEmail,
        changeType
      });

      lastSyncedSignatureRef.current = currentSignature;
      const saveDate = new Date(result.savedAt);
      setLastSaved(saveDate);
      if (result.revisionId) setLastRevisionId(result.revisionId);
      if (result.version) setVersionNumber(result.version);

      if (!isOnline || result.source === 'local') {
        setStatus('offline');
      } else {
        setStatus('synced');
      }
    } catch (err) {
      console.error('[AutoSave Sync Error]:', err);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [isEnabled, computeStateSignature, getCurrentState, hasModel, proceduralSpec, currentDesign, prompt, historyNodes, token, userEmail, isOnline]);

  // Change Detection & Debounced Auto-Sync
  useEffect(() => {
    const currentSig = computeStateSignature();
    if (lastSyncedSignatureRef.current && currentSig !== lastSyncedSignatureRef.current) {
      setStatus('dirty');

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        performSync('param_change_debounced');
      }, 3500); // 3.5s debounce after user stops tweaking parameters
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [computeStateSignature, performSync]);

  // Periodic Timer (e.g. Every 20 seconds syncs if dirty)
  useEffect(() => {
    if (!isEnabled || intervalSeconds <= 0) return;

    if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);

    periodicTimerRef.current = setInterval(() => {
      const currentSig = computeStateSignature();
      if (currentSig !== lastSyncedSignatureRef.current) {
        performSync('periodic_interval');
      }
    }, intervalSeconds * 1000);

    return () => {
      if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);
    };
  }, [isEnabled, intervalSeconds, computeStateSignature, performSync]);

  // Emergency Unload Listener (Page reload, tab close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (latestStateRef.current) {
        workspaceAutosaveService.sendBeaconSync(latestStateRef.current, token);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [token]);

  // Check for prior autosaved session on initial mount
  useEffect(() => {
    let isMounted = true;
    async function checkRecovery() {
      try {
        const res = await workspaceAutosaveService.fetchLatestAutoSave({ token, userEmail });
        if (isMounted && res.hasAutoSave && res.autosave) {
          const snap = res.autosave;
          // Check if snapshot contains geometric data or custom parameters
          const hasData = !!snap.geometry || !!snap.design || (snap.parameters && snap.parameters.prompt?.length > 0);
          if (hasData) {
            setRecoverableSnapshot(snap);
            setRecoverableSource(res.source);
            setHasRecoverableSession(true);
          }
        }
      } catch (err) {
        console.warn('[AutoSave Recovery Check Warning]:', err);
      }
    }

    checkRecovery();
    return () => {
      isMounted = false;
    };
  }, [token, userEmail]);

  // Relative Time Display Updater
  useEffect(() => {
    if (!lastSaved) {
      setLastSavedText('Not saved yet');
      return;
    }

    const updateText = () => {
      const diffSec = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (diffSec < 5) {
        setLastSavedText('Just now');
      } else if (diffSec < 60) {
        setLastSavedText(`${diffSec}s ago`);
      } else if (diffSec < 3600) {
        const mins = Math.floor(diffSec / 60);
        setLastSavedText(`${mins}m ago`);
      } else {
        const hrs = Math.floor(diffSec / 3600);
        setLastSavedText(`${hrs}h ago`);
      }
    };

    updateText();
    const interval = setInterval(updateText, 5000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  // Manual Actions
  const syncNow = useCallback(() => {
    return performSync('manual_user_trigger');
  }, [performSync]);

  const restoreSession = useCallback(() => {
    if (recoverableSnapshot && onRestoreState) {
      onRestoreState(recoverableSnapshot);
      lastSyncedSignatureRef.current = computeStateSignature();
      setHasRecoverableSession(false);
      setLastSaved(new Date(recoverableSnapshot.timestamp));
      setStatus('synced');
    }
  }, [recoverableSnapshot, onRestoreState, computeStateSignature]);

  const dismissRecovery = useCallback(() => {
    setHasRecoverableSession(false);
  }, []);

  const clearSavedState = useCallback(async () => {
    await workspaceAutosaveService.clearAutoSave({ token, userEmail });
    setRecoverableSnapshot(null);
    setHasRecoverableSession(false);
    setLastSaved(null);
    lastSyncedSignatureRef.current = '';
    setStatus('dirty');
  }, [token, userEmail]);

  return {
    status,
    lastSaved,
    lastSavedText,
    lastRevisionId,
    versionNumber,
    intervalSeconds,
    setIntervalSeconds,
    isEnabled,
    setIsEnabled,
    isOnline,
    hasRecoverableSession,
    recoverableSnapshot,
    recoverableSource,
    syncNow,
    restoreSession,
    dismissRecovery,
    clearSavedState,
    markAsSynced: () => {
      lastSyncedSignatureRef.current = computeStateSignature();
      setStatus('synced');
      setLastSaved(new Date());
    }
  };
}
