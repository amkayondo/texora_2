import React from 'react';

export const Web3Badge: React.FC<{ children: React.ReactNode, type?: 'info' | 'success' | 'warning' | 'error' | 'default' }> = ({ children, type = 'default' }) => {
  const colors = {
    info: 'border-transparent bg-blue-900/40 text-blue-300 hover:bg-blue-900/60',
    success: 'border-transparent bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60',
    warning: 'border-transparent bg-amber-900/40 text-amber-300 hover:bg-amber-900/60',
    error: 'border-transparent bg-red-900/40 text-red-300 hover:bg-red-900/60',
    default: 'border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 ${colors[type]}`}>
      {children}
    </span>
  );
};