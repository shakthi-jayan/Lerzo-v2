import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, FilePlus,
  BookOpen, Tag, Clock, Download, Settings, CreditCard, Database,
  Menu, LogOut, ShieldCheck, ShieldOff, MessageSquare, BarChart,
  Sun, Moon, Calendar, CreditCard as IDCardIcon, Award, Kanban
} from 'lucide-react';
import { APP_SUBTITLE, SIDEBAR_ITEMS } from '../constants';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { CommandPalette } from './CommandPalette';

interface LayoutProps {
  children: React.ReactNode;
}

const IconMap: Record<string, any> = {
  LayoutDashboard, Users, UserPlus, ClipboardList, FilePlus,
  BookOpen, Tag, Clock, Download, Settings, CreditCard, Database, MessageSquare, BarChart, Calendar, IDCardIcon, Award, Kanban
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logoUrl, centreSettings, logout, currentUserEmail, error } = useData();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('lerzo_bypass_auth') === 'true') {
      setIsDevMode(true);
    }
  }, []);

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();

    // Close the modal
    setShowLogoutModal(false);

    // Replace current history entry to prevent back navigation
    window.history.pushState(null, '', '#/login');

    // Prevent back button
    window.addEventListener('popstate', () => {
      window.history.pushState(null, '', '#/login');
    });

    // Force reload to reset all state
    window.location.replace('#/login');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {error && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white px-4 py-2 text-center text-sm font-bold shadow-md flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          {error}
        </div>
      )}
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-100 flex flex-col gap-6">
            {/* App Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                <img src="/logo.png" alt="Lerzo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Lerzo</h1>
                <span className="text-[10px] text-slate-400 dark:text-slate-300 font-medium uppercase tracking-wider">Student Manager</span>
              </div>
            </div>

            {/* Centre Brand */}
            <Link to="/settings" className="flex items-center gap-3 pl-1 group cursor-pointer">
              <div className="w-8 h-8 bg-white border border-slate-200 text-slate-700 rounded flex items-center justify-center font-bold text-xs overflow-hidden group-hover:border-blue-400 transition-colors">
                {logoUrl && (logoUrl.startsWith('http') || logoUrl.startsWith('data:image')) ? (
                  <img src={logoUrl} alt="Centre Logo" className="w-full h-full object-contain" />
                ) : (
                  centreSettings.name.substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-semibold text-slate-700 text-xs truncate group-hover:text-blue-600 transition-colors" title={centreSettings.name}>{centreSettings.name}</h2>
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <span className="block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
            {SIDEBAR_ITEMS.map((item, index) => {
              if (item.section) {
                return (
                  <div key={index} className="px-3 pt-6 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {item.section}
                  </div>
                );
              }

              const Icon = IconMap[item.icon || 'LayoutDashboard'];
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={index}
                  to={item.path!}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {item.label}
                </Link>
              );
            })}

            {/* Manual Links for new features not yet in SIDEBAR_ITEMS constant */}
            <Link to="/staff" className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname.startsWith('/staff') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Users className={`mr-3 h-5 w-5 shrink-0 ${location.pathname.startsWith('/staff') ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              Staff
            </Link>
            <Link to="/attendance" className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/attendance' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Calendar className={`mr-3 h-5 w-5 shrink-0 ${location.pathname === '/attendance' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              Attendance
            </Link>
            <Link to="/id-cards" className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/id-cards' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <IDCardIcon className={`mr-3 h-5 w-5 shrink-0 ${location.pathname === '/id-cards' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              ID Cards
            </Link>
            <Link to="/certificates" className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/certificates' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Award className={`mr-3 h-5 w-5 shrink-0 ${location.pathname === '/certificates' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              Certificates
            </Link>
            <Link to="/enquiries/kanban" className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${location.pathname === '/enquiries/kanban' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <Kanban className={`mr-3 h-5 w-5 shrink-0 ${location.pathname === '/enquiries/kanban' ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
              Enquiry Board
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="flex items-center w-full px-3 py-2 mb-2 text-sm font-medium text-slate-600 dark:text-slate-400 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light' ? <Moon className="mr-3 h-5 w-5" /> : <Sun className="mr-3 h-5 w-5" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>

            {isDevMode && (
              <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800 flex items-center gap-2">
                <ShieldOff className="w-3 h-3" />
                <span className="font-bold">Dev Mode</span>
              </div>
            )}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-500 hover:text-slate-700">
              <Menu className="h-6 w-6" />
            </button>
            <span className="font-bold text-slate-800 dark:text-slate-100">{centreSettings.name}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};
