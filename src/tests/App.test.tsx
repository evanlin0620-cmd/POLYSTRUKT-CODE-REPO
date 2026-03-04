import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';

// Mock the useAuth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'dummy-token', // Provide a dummy token
    logout: vi.fn(),
  }),
}));

// Mock child components to isolate the App component
vi.mock('../../components/Navbar', () => ({ Navbar: () => <div>Navbar Mock</div> }));
vi.mock('../../components/Hero', () => ({ Hero: () => <div>Hero Mock</div> }));
vi.mock('../../components/Stats', () => ({ Stats: () => <div>Stats Mock</div> }));
vi.mock('../../components/Gallery', () => ({ Gallery: () => <div>Gallery Mock</div> }));
vi.mock('../../components/CustomCursor', () => ({ CustomCursor: () => <div>CustomCursor Mock</div> }));
vi.mock('../../components/ChatWidget', () => ({ ChatWidget: () => <div>ChatWidget Mock</div> }));
vi.mock('../../components/Workspace', () => ({ Workspace: () => <div>Workspace Mock</div> }));
vi.mock('@studio-freight/react-lenis', () => ({ ReactLenis: ({ children }) => <>{children}</> }));

// Mock framer-motion to avoid complex animations in tests
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...(actual as any),
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      ...((actual as any).motion),
      div: ({ children }) => <div>{children}</div>,
    },
  };
});

describe('App', () => {
  it('renders the main components', () => {
    render(<App />);
    const navbar = screen.getByText(/Navbar Mock/i);
    expect(navbar).toBeInTheDocument();
  });
});
