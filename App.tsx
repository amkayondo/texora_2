import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { ThemeProvider } from './hooks/use-theme';
import { AuthPage } from './pages/AuthPage';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { DonorDashboard } from './pages/DonorDashboard';
import { UserRole } from './types';
import { Toaster } from 'sonner';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {currentUser.role === UserRole.CREATOR && <CreatorDashboard />}
      
      {currentUser.role === UserRole.DONOR && <DonorDashboard />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="texora-ui-theme">
      <AppProvider>
        <MainContent />
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
        />
      </AppProvider>
    </ThemeProvider>
  );
}