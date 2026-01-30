import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, description, action }) => {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900/50 text-card-foreground shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
            <div className="flex justify-between items-start">
               <div>
                 {title && <h3 className="font-semibold leading-none tracking-tight text-xl">{title}</h3>}
                 {description && <p className="text-sm text-zinc-400 mt-2">{description}</p>}
               </div>
               {action}
            </div>
        </div>
      )}
      <div className="p-6 pt-2">
        {children}
      </div>
    </div>
  );
};