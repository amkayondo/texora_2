import React from 'react';
import { useApp } from '../AppContext';
import { Wallet, LogOut, Command } from 'lucide-react';
import { Button } from './Button';
import { Web3Badge } from './Web3Badge';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useApp();

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg">T</div>
          <span className="text-lg font-semibold text-zinc-100 tracking-tight">Texora</span>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                 <div className="text-right hidden lg:block">
                     <p className="text-sm font-medium text-zinc-200">{currentUser.name}</p>
                     <p className="text-xs text-zinc-500">{currentUser.role === 'DONOR' ? 'Investor Node' : 'Creator Node'}</p>
                 </div>
                 <Web3Badge type="info">
                     <Wallet size={12} className="mr-1 inline" />
                     ${currentUser.balance.toLocaleString()}
                 </Web3Badge>
              </div>
              
              <Button variant="ghost" size="sm" onClick={logout} className="text-zinc-400 hover:text-white">
                   <LogOut className="h-4 w-4 mr-2" /> Disconnect
              </Button>
            </>
          ) : (
             <span className="text-sm text-zinc-500 font-mono">System: Offline</span>
          )}
        </div>
      </div>
    </nav>
  );
};