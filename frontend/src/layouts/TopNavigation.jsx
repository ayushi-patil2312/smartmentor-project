import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Search, Sun, Moon, Menu, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../api';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function TopNavigation({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/${user.id}`);
      const json = await res.json();
      setNotifications(Array.isArray(json) ? json : []);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 20000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showNotifications]);

  const unread = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!user?.id || unread === 0) return;
    await fetch(`${BASE_URL}/api/notifications/read-all/${user.id}`, { method: 'POST' });
    fetchNotifications();
  };

  const markOne = async (n) => {
    if (n.is_read) return;
    await fetch(`${BASE_URL}/api/notifications/${n.id}/read`, { method: 'POST' });
    fetchNotifications();
  };

  return (
    <header className="h-[72px] glass-panel sticky top-0 z-10 w-full flex items-center justify-between px-4 md:px-8 shadow-sm">
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

      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-100 transition-all rounded-full"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className="relative p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-100 transition-all rounded-full"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="font-semibold text-sm">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Check size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500 italic">No notifications yet</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markOne(n)}
                      className={`block w-full text-left p-3 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                        !n.is_read ? 'bg-blue-50/40 dark:bg-blue-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold cursor-pointer ring-2 ring-white dark:ring-gray-900 shadow-md">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
