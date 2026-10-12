import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface ShiningTextProps {
  text: string;
  className?: string;
}

export const ShiningText: React.FC<ShiningTextProps> = ({ text, className }) => {
  return (
    <div className={cn("relative inline-block group", className)}>
      <span className="relative z-10 text-white font-black uppercase tracking-tighter mix-blend-difference">
        {text}
      </span>
      <motion.div
        animate={{
          left: ['-20%', '120%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-0"
      />
    </div>
  );
};
