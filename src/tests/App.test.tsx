
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import App from '@/App';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
vi.mock('@/hooks/useAuth');

// Mock geminiService to prevent actual API calls
vi.mock('@/services/geminiService', () => ({
  runStreamingAnalysis: vi.fn(),
}));

// Mock child components to isolate the App component
vi.mock('@/components/Navbar', () => ({ Navbar: () => <div>Navbar Mock</div> }));
vi.mock('@/components/Hero', () => ({ Hero: () => <div>Hero Mock</div> }));
vi.mock('@/components/Stats', () => ({ Stats: () => <div>Stats Mock</div> }));
vi.mock('@/components/Gallery', () => ({ Gallery: () => <div>Gallery Mock</div> }));
vi.mock('@/components/CommunityShowcase', () => ({ default: () => <div>CommunityShowcase Mock</div> }));
vi.mock('@/components/CustomCursor', () => ({ CustomCursor: () => <div>CustomCursor Mock</div> }));
vi.mock('@/components/ChatWidget', () => ({ ChatWidget: () => <div>ChatWidget Mock</div> }));
vi.mock('@/components/Workspace', () => ({ Workspace: () => <div>Workspace Mock</div> }));
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
      button: ({ children }) => <button>{children}</button>,
      a: ({ children }) => <a>{children}</a>,
    },
  };
});

describe('App', () => {
  it('renders Workspace when logged in', () => {
    // Arrange
    (useAuth as unknown as Mock).mockReturnValue({ token: 'dummy-token', logout: vi.fn() });

    // Act
    render(<App />);

    // Assert
    expect(screen.getByText('Workspace Mock')).toBeInTheDocument();
  });

  it('renders landing page when not logged in', () => {
    // Arrange
    (useAuth as unknown as Mock).mockReturnValue({ token: null, logout: vi.fn() });

    // Act
    render(<App />);

    // Assert
    expect(screen.getByText('Hero Mock')).toBeInTheDocument();
    expect(screen.getByText('Stats Mock')).toBeInTheDocument();
    expect(screen.getByText('Gallery Mock')).toBeInTheDocument();
    expect(screen.getByText('CommunityShowcase Mock')).toBeInTheDocument();
  });
});
