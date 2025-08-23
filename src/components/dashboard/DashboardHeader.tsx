import React from 'react';
import { Bell, Menu, Moon, Sun, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useKeycloakAuth } from '@/contexts/KeycloakContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';

interface DashboardHeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  darkMode,
  setDarkMode,
  setMobileSidebarOpen
}) => {
  const { t } = useTranslation();
  const { user: localUser } = useAuth();
  const { user: keycloakUser, isAuthenticated: isKeycloakAuthenticated } = useKeycloakAuth();
  
  // Prefer Keycloak user if available, fallback to local user
  const currentUser = keycloakUser || localUser;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <button 
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex items-center justify-center flex-1 h-full px-2">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain max-w-[200px] max-h-[40px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          {currentUser && (
            <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
              <User className="h-4 w-4" />
              <span>{currentUser.firstName}</span>
              {isKeycloakAuthenticated && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                  KC
                </span>
              )}
            </div>
          )}
          <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <Bell className="h-5 w-5" />
          </button>
          <CurrencySwitcher />
          <LanguageSwitcher />
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentUser ? `${t('welcomeBack')}, ${currentUser.firstName}!` : t('welcomeBack')}
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <p className="text-slate-600 dark:text-slate-400">{t('manageProjects')}</p>
            {isKeycloakAuthenticated && currentUser && (
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                  Keycloak User
                </span>
                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded">
                  {currentUser.role || 'user'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {currentUser && (
            <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
              <User className="h-5 w-5" />
              <span className="font-medium">{currentUser.firstName} {currentUser.lastName}</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                {currentUser.email}
              </span>
            </div>
          )}
          <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <Bell className="h-5 w-5" />
          </button>
          <CurrencySwitcher />
          <LanguageSwitcher />
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardHeader;