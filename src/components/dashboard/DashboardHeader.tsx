import React from 'react';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('welcomeBack')}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">{t('manageProjects')}</p>
        </div>
        <div className="flex items-center space-x-4">
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