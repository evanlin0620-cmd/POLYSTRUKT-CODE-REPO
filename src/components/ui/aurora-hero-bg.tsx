import React from 'react';
import { cn } from '../../lib/utils';

interface AuroraHeroProps {
  children: ReactNode;
  className?: string;
}

export const AuroraHero: React.FC<AuroraHeroProps> = ({ children, className }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle,rgba(79,70,229,0.05)_0%,transparent_70%)]" />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

import { ReactNode } from 'react';
