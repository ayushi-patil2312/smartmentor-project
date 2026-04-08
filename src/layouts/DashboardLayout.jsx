import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  if (!user) return <Navigate to="/login" />;

  const role = user?.role || 'student';

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-gray-900">
      <Sidebar role={role} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex flex-col flex-1 w-full relative">
        <TopNavigation onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="h-full overflow-y-auto p-4 md:p-8 scroll-smooth bg-background dark:bg-gray-900">
          <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
