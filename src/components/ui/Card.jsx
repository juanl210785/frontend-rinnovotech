import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, hoverEffect = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm shadow-slate-100 dark:shadow-none',
        hoverEffect && 'bento-card transition-all duration-300 hover:shadow-md hover:border-blue-500/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
