import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function TopNavigation({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-[72px] glass-panel sticky top-0 z-10 w-full flex items-center justify-between px-6 md:px-8 shadow-sm">
      <div className="flex items-center gap-6">
        <button onClick={onMenuClick} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Menu size={24} />
        </button>
        
        <div className="hidden sm:flex items-center relative">
          <Search className="absolute left-4 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search students, mentors, or reports..." 
            className="input-field pl-11 h-11 w-72 md:w-96 text-sm bg-gray-100 dark:bg-gray-800/50 border-transparent rounded-2xl focus:bg-white dark:focus:bg-gray-800"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-5">
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-100 transition-all rounded-full"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-100 transition-all rounded-full"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-soft-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-sm">
                Notifications
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <p className="text-sm font-medium">New assignment posted</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <p className="text-sm font-medium">System maintenance update</p>
                  <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="h-10 w-10 ml-2 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold cursor-pointer ring-2 ring-white dark:ring-gray-900 shadow-md">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
