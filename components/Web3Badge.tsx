import React from 'react';

export const Web3Badge: React.FC<{ children: React.ReactNode, type?: 'info' | 'success' | 'warning' | 'error' | 'default' }> = ({ children, type = 'default' }) => {
  const colors = {
    info: 'border-border bg-card text-foreground hover:bg-muted',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
    warning: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
    error: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
    default: 'border-border bg-muted text-muted-foreground hover:bg-accent'
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${colors[type]}`}>
      {children}
    </span>
  );
};
