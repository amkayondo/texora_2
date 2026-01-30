import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { DonorDashboard } from './pages/DonorDashboard';
import { UserRole } from './types';

const MainContent: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#111] text-white selection:bg-blue-500 selection:text-white pb-20">
      <Navbar />
      
      {currentUser.role === UserRole.CREATOR && <CreatorDashboard />}
      
      {currentUser.role === UserRole.DONOR && <DonorDashboard />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}