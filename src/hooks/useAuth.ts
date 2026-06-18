import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface User {
  email: string;
  name?: string;
  role?: string;
  skills?: string[];
  certifications?: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ mfaRequired?: boolean; email?: string; _debugOtp?: string } | void>;
  verifyOtp: (email: string, otp: string, rememberMe?: boolean) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  register: (
    email: string, 
    password: string, 
    username?: string, 
    role?: string, 
    skills?: string[], 
    certifications?: string[]
  ) => Promise<void>;
  loginWithGoogle: (mode?: 'signin' | 'signup') => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        user: null,
        login: async (email, password, rememberMe) => {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe })
          });
          const body = await res.text();
          if (!res.ok) {
            let errorMessage = 'Login failed';
            if (body && body.trim().startsWith('{')) {
              try {
                const data = JSON.parse(body);
                errorMessage = data.error || errorMessage;
              } catch (e) {}
            } else if (body) {
              errorMessage = body;
            }
            throw new Error(errorMessage);
          }
          if (body && body.trim().startsWith('{')) {
            const data = JSON.parse(body);
            if (data.mfaRequired) {
              return { mfaRequired: true, email: data.email, _debugOtp: data._debugOtp };
            }
            set({ token: data.token, user: data.user });
          }
        },
        verifyOtp: async (email, otp, rememberMe) => {
          const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, rememberMe })
          });
          const body = await res.text();
          if (!res.ok) {
            let errorMessage = 'Verification failed';
            if (body && body.trim().startsWith('{')) {
              try {
                const data = JSON.parse(body);
                errorMessage = data.error || errorMessage;
              } catch (e) {}
            } else if (body) {
              errorMessage = body;
            }
            throw new Error(errorMessage);
          }
          if (body && body.trim().startsWith('{')) {
            const data = JSON.parse(body);
            set({ token: data.token, user: data.user });
          }
        },
        forgotPassword: async (email) => {
          const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const body = await res.text();
          if (!res.ok) {
            let errorMessage = 'Failed to request password reset';
            if (body && body.trim().startsWith('{')) {
              try {
                const data = JSON.parse(body);
                errorMessage = data.error || errorMessage;
              } catch (e) {}
            } else if (body) {
              errorMessage = body;
            }
            throw new Error(errorMessage);
          }
          if (body && body.trim().startsWith('{')) {
            const data = JSON.parse(body);
            return data.message || 'Restoration requested successfully.';
          }
          return 'Restoration requested successfully.';
        },
        register: async (email, password, username, role, skills, certifications) => {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, username, role, skills, certifications })
          });
          const body = await res.text();
          if (!res.ok) {
            let errorMessage = 'Registration failed';
            if (body && body.trim().startsWith('{')) {
              try {
                const data = JSON.parse(body);
                errorMessage = data.error || errorMessage;
              } catch (e) {}
            } else if (body) {
              errorMessage = body;
            }
            throw new Error(errorMessage);
          }
          if (body && body.trim().startsWith('{')) {
            const data = JSON.parse(body);
            set({ token: data.token, user: data.user });
          }
        },
        loginWithGoogle: async (mode?: 'signin' | 'signup') => {
          try {
            console.log('[Auth] Opening Google Popup...');
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            console.log('[Auth] Google Popup successful, user:', user.email);

            if (!user.email) {
              throw new Error('Google account must have an email address.');
            }
            
            const idToken = await user.getIdToken();
            
            console.log('[Auth] Synchronizing with Polystrukt backend...');
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                idToken,
                email: user.email, 
                name: user.displayName,
                mode
              })
            });

            console.log('[Auth] Backend response status:', res.status);
            const body = await res.text();
            console.log('[Auth] Backend response body:', body.slice(0, 200));
            
            if (!res.ok) {
              let errorMessage = `Service synchronization failed (${res.status})`;
              try {
                if (body && body.trim().startsWith('{')) {
                  const data = JSON.parse(body);
                  errorMessage = data.error || data.message || errorMessage;
                } else if (body && body.length < 500) {
                  errorMessage = body;
                }
              } catch (e) {
                console.error('[Auth] Error parsing error body:', e);
              }
              throw new Error(errorMessage);
            }

            if (body && body.trim().startsWith('{')) {
              const data = JSON.parse(body);
              console.log('[Auth] Successfully synchronized. Setting token.');
              set({ token: data.token, user: data.user });
            } else {
              throw new Error('Invalid response from authentication server.');
            }
          } catch (error: any) {
            console.error('[Auth] Google Auth Error Details:', error);
            if (error.code === 'auth/popup-blocked') {
              throw new Error('Popup blocked by browser. Please allow popups for this site.');
            } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
              throw new Error('Sign-in cancelled.');
            }
            throw error;
          }
        },
        logout: () => set({ token: null, user: null }),
        setSession: (token, user) => set({ token, user }),
      }),
      { name: 'auth-storage' }
    )
  )
);
