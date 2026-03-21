import { vi } from 'vitest';

const useAuth = vi.fn(() => ({
  user: { id: '1', name: 'Test User' },
  loading: false,
}));

export default useAuth;
