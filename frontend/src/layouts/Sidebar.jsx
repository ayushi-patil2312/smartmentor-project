import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, BarChart3, User, LogOut, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ role, isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    switch(role) {
      case 'admin':
        return [
          { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
          { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
          { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        ];
      case 'mentor':
        return [
          { name: 'Dashboard', path: '/mentor', icon: <LayoutDashboard size={20} /> },
          { name: 'My Students', path: '/mentor/students', icon: <Users size={20} /> },
          { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} /> },
          { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        ];
      case 'student':
      default:
        return [
          { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
          { name: 'Progress', path: '/reports', icon: <Award size={20} /> },
          { name: 'Profile', path: '/profile', icon: <User size={20} /> },
        ];
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="h-[72px] flex items-center px-6 border-b border-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-1.5 rounded-lg shadow-sm shadow-primary/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 dark:text-white font-bold text-lg tracking-tight leading-none">Mentorship Pro</span>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">Academic Curator</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
        {getLinks().map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                ? 'bg-primary/5 text-primary dark:bg-primary/10 dark:text-indigo-400' 
                : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`
            }
          >
            {link.icon}
            {link.name}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
