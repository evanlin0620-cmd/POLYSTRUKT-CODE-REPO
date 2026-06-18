import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';

export interface CloudProject {
  id: string;
  userId: string;
  name: string;
  design: any;
  createdAt: any;
  updatedAt: any;
}

export interface CloudChatSession {
  id: string;
  userId: string;
  name: string;
  messages: any[];
  createdAt: any;
  updatedAt: any;
}

/**
 * Handle Firestore Error wraps database errors safely according to security guidelines
 */
const handleFirestoreError = (action: string, error: any) => {
  console.error(`[Firestore Error during ${action}]:`, error);
  let userFriendly = `Failed to ${action}.`;
  if (error?.code === 'permission-denied') {
    userFriendly += " Access Denied: Insufficient collection hierarchy authorization.";
  } else if (error?.message?.includes('offline')) {
    userFriendly += " Network offline: Workspace changes queued local.";
  }
  return new Error(userFriendly);
};

export const cloudWorkspaceService = {
  /**
   * Save CAD project to Firestore Cloud
   */
  async saveProject(userId: string, projectId: string, name: string, design: any): Promise<void> {
    if (!userId) return;
    try {
      const projectRef = doc(db, 'users', userId, 'projects', projectId);
      await setDoc(projectRef, {
        userId,
        name,
        design,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`[Cloud Workspace] Synchronized Project: ${projectId} on Firestore Cloud.`);
    } catch (err) {
      throw handleFirestoreError(`persist project ${name}`, err);
    }
  },

  /**
   * Retrieve all CAD projects for this user from Firestore
   */
  async getProjects(userId: string): Promise<CloudProject[]> {
    if (!userId) return [];
    try {
      const colRef = collection(db, 'users', userId, 'projects');
      const querySnap = await getDocs(colRef);
      const output: CloudProject[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        output.push({
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          design: data.design,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      return output;
    } catch (err) {
      throw handleFirestoreError('retrieve cloud designs', err);
    }
  },

  /**
   * Delete project from Firestore Cloud
   */
  async deleteProject(userId: string, projectId: string): Promise<void> {
    if (!userId || !projectId) return;
    try {
      const projectRef = doc(db, 'users', userId, 'projects', projectId);
      await deleteDoc(projectRef);
      console.log(`[Cloud Workspace] Erased Project: ${projectId} on Firestore Cloud.`);
    } catch (err) {
      throw handleFirestoreError('delete cloud design', err);
    }
  },

  /**
   * Sync Chat session to Firestore Cloud
   */
  async saveChatSession(userId: string, sessionId: string, name: string, messages: any[]): Promise<void> {
    if (!userId || !sessionId) return;
    try {
      // Clean up messages array for Firestore compatibility (e.g. ensure timestamp dates are serialized)
      const sanitizedMessages = messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp || new Date().toISOString()
      }));

      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      await setDoc(sessionRef, {
        userId,
        name,
        messages: sanitizedMessages,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true });
      console.log(`[Cloud Workspace] Synchronized Chat Session: ${sessionId} on Firestore Cloud.`);
    } catch (err) {
      throw handleFirestoreError(`save session ${name}`, err);
    }
  },

  /**
   * Retrieve all chat sessions for this user from Firestore
   */
  async getChatSessions(userId: string): Promise<CloudChatSession[]> {
    if (!userId) return [];
    try {
      const colRef = collection(db, 'users', userId, 'sessions');
      const querySnap = await getDocs(colRef);
      const output: CloudChatSession[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        output.push({
          id: docSnap.id,
          userId: data.userId,
          name: data.name,
          messages: data.messages,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      });
      return output;
    } catch (err) {
      throw handleFirestoreError('retrieve cloud sessions', err);
    }
  },

  /**
   * Delete Chat session from Firestore
   */
  async deleteChatSession(userId: string, sessionId: string): Promise<void> {
    if (!userId || !sessionId) return;
    try {
      const sessionRef = doc(db, 'users', userId, 'sessions', sessionId);
      await deleteDoc(sessionRef);
      console.log(`[Cloud Workspace] Erased Session: ${sessionId} from Firestore Cloud.`);
    } catch (err) {
      throw handleFirestoreError('delete cloud session', err);
    }
  }
};
