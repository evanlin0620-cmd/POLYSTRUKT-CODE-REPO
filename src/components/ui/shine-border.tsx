import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string[];
  borderWidth?: number;
  duration?: number;
  borderRadius?: number;
}

export const ShineBorder: React.FC<ShineBorderProps> = ({
  children,
  className,
  color = ["#4f46e5", "#818cf8", "#4f46e5"],
  borderWidth = 1,
  duration = 14,
  borderRadius = 0
}) => {
  return (
    <div className={cn("relative group", className)} style={{ borderRadius: `${borderRadius}px` }}>
      {/* Shining Border Effect */}
      <div 
        className="absolute inset-[-1px] z-0 opacity-50 group-hover:opacity-100 transition-opacity"
        style={{ borderRadius: `${borderRadius + 1}px`, padding: `${borderWidth}px`, overflow: 'hidden' }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0deg,var(--tw-gradient-from)_90deg,var(--tw-gradient-to)_180deg,var(--tw-gradient-from)_270deg,transparent_360deg)] opacity-60"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${color[0]}, ${color[1]}, ${color[2]}, transparent)`,
          }}
        />
      </div>
      
      <div className="relative z-10 w-full h-full bg-background" style={{ borderRadius: `${borderRadius}px` }}>
        {children}
      </div>
    </div>
  );
};
