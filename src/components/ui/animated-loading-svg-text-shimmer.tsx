import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LoadingBreadcrumbProps {
  text: string;
  className?: string;
}

export const LoadingBreadcrumb: React.FC<LoadingBreadcrumbProps> = ({ text, className }) => {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              height: [4, 16, 4],
              backgroundColor: ['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 1)', 'rgba(99, 102, 241, 0.2)']
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              delay: i * 0.15,
              ease: "easeInOut"
            }}
            className="w-1 rounded-full"
          />
        ))}
      </div>
      <div className="relative overflow-hidden group">
        <span className="text-xl md:text-2xl font-black uppercase tracking-tighter font-unique text-white">
          {text}
        </span>
        <motion.div 
          animate={{ left: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 z-10"
        />
      </div>
    </div>
  );
};
