import { AutoSaveSceneState, AutoSaveStatus } from '../types';
import { cloudWorkspaceService } from './cloudWorkspaceService';

const LOCAL_STORAGE_KEY = 'polystrukt_cad_active_autosave';
const LOCAL_SESSION_KEY = 'polystrukt_cad_session_id';

export interface AutoSaveSyncResult {
  success: boolean;
  savedAt: string;
  revisionId?: string;
  version?: number;
  message?: string;
  source: 'backend' | 'cloud' | 'local';
}

export const workspaceAutosaveService = {
  /**
   * Get or initialize a stable client session ID for this browser
   */
  getSessionId(): string {
    try {
      let id = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!id) {
        id = `cad_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(LOCAL_SESSION_KEY, id);
      }
      return id;
    } catch {
      return `cad_sess_${Date.now()}`;
    }
  },

  /**
   * Sync active CAD workspace state to the backend
   */
  async syncSceneStateToBackend(
    state: AutoSaveSceneState,
    options?: {
      token?: string | null;
      userEmail?: string | null;
      changeType?: string;
    }
  ): Promise<AutoSaveSyncResult> {
    const sessionId = this.getSessionId();
    const payload = {
      ...state,
      sessionId,
      timestamp: new Date().toISOString(),
      changeType: options?.changeType || 'periodic_sync'
    };

    // Always mirror to localStorage immediately for instant offline resilience
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('[AutoSave Local Mirror Warning]:', e);
    }

    let backendSuccess = false;
    let backendResult: any = null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      };

      if (options?.token) {
        headers['Authorization'] = `Bearer ${options.token}`;
      }

      const res = await fetch('/api/workspace/autosave', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        backendResult = await res.json();
        backendSuccess = true;
      }
    } catch (netErr) {
      console.warn('[AutoSave Backend Sync Warning - Queued locally]:', netErr);
    }

    // Also mirror to Firestore if user has signed-in email identity
    if (options?.userEmail) {
      try {
        await cloudWorkspaceService.saveAutoSaveState(options.userEmail, payload);
      } catch (cloudErr) {
        console.warn('[AutoSave Firestore Sync Warning]:', cloudErr);
      }
    }

    if (backendSuccess && backendResult) {
      return {
        success: true,
        savedAt: backendResult.savedAt || new Date().toISOString(),
        revisionId: backendResult.revisionId,
        version: backendResult.version,
        message: backendResult.message,
        source: 'backend'
      };
    }

    return {
      success: true,
      savedAt: payload.timestamp,
      revisionId: `local_${Date.now()}`,
      message: 'Workspace scene state preserved locally (Offline safe).',
      source: 'local'
    };
  },

  /**
   * Fast emergency sync on page unload / refresh using keepalive fetch
   */
  sendBeaconSync(state: AutoSaveSceneState, token?: string | null): void {
    try {
      const sessionId = this.getSessionId();
      const payload = JSON.stringify({
        ...state,
        sessionId,
        timestamp: new Date().toISOString(),
        changeType: 'unload_emergency_sync'
      });

      // Save locally
      localStorage.setItem(LOCAL_STORAGE_KEY, payload);

      // Fire keepalive fetch to backend
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch('/api/workspace/autosave', {
        method: 'POST',
        headers,
        body: payload,
        keepalive: true
      }).catch(() => {});
    } catch (e) {
      // Ignore unload errors
    }
  },

  /**
   * Fetch the latest auto-saved scene from backend, Firestore, or local storage
   */
  async fetchLatestAutoSave(options?: {
    token?: string | null;
    userEmail?: string | null;
  }): Promise<{
    hasAutoSave: boolean;
    autosave: AutoSaveSceneState | null;
    source: 'backend' | 'cloud' | 'local' | 'none';
    lastSaved?: string;
    version?: number;
  }> {
    const sessionId = this.getSessionId();

    // 1. Try Backend API
    try {
      const headers: Record<string, string> = {
        'X-Session-ID': sessionId,
      };
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;

      const res = await fetch('/api/workspace/autosave', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.hasAutoSave && data.autosave) {
          return {
            hasAutoSave: true,
            autosave: data.autosave,
            source: 'backend',
            lastSaved: data.lastSaved || data.autosave.savedAt,
            version: data.version
          };
        }
      }
    } catch (e) {
      console.warn('[AutoSave API fetch failed, trying fallbacks]:', e);
    }

    // 2. Try Firestore Cloud if user is authenticated
    if (options?.userEmail) {
      try {
        const cloudState = await cloudWorkspaceService.getAutoSaveState(options.userEmail);
        if (cloudState && cloudState.state) {
          return {
            hasAutoSave: true,
            autosave: cloudState.state,
            source: 'cloud',
            lastSaved: cloudState.updatedAt
          };
        }
      } catch (cloudErr) {
        console.warn('[AutoSave Cloud fetch warning]:', cloudErr);
      }
    }

    // 3. Try LocalStorage fallback
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.geometry || parsed.parameters || parsed.design)) {
          return {
            hasAutoSave: true,
            autosave: parsed,
            source: 'local',
            lastSaved: parsed.timestamp
          };
        }
      }
    } catch (localErr) {
      console.warn('[AutoSave Local fetch warning]:', localErr);
    }

    return {
      hasAutoSave: false,
      autosave: null,
      source: 'none'
    };
  },

  /**
   * Fetch historical snapshot revisions from backend for disaster rollback
   */
  async fetchAutoSaveSnapshots(token?: string | null): Promise<any[]> {
    try {
      const sessionId = this.getSessionId();
      const headers: Record<string, string> = {
        'X-Session-ID': sessionId,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/workspace/autosave/snapshots', { headers });
      if (res.ok) {
        const data = await res.json();
        return data.snapshots || [];
      }
    } catch (e) {
      console.warn('[AutoSave Snapshots fetch failed]:', e);
    }
    return [];
  },

  /**
   * Clear auto-saved cache in backend, cloud, and local storage
   */
  async clearAutoSave(options?: {
    token?: string | null;
    userEmail?: string | null;
  }): Promise<void> {
    const sessionId = this.getSessionId();
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}

    try {
      const headers: Record<string, string> = {
        'X-Session-ID': sessionId,
      };
      if (options?.token) headers['Authorization'] = `Bearer ${options.token}`;
      await fetch('/api/workspace/autosave', { method: 'DELETE', headers });
    } catch {}

    if (options?.userEmail) {
      try {
        await cloudWorkspaceService.clearAutoSaveState(options.userEmail);
      } catch {}
    }
  }
};
