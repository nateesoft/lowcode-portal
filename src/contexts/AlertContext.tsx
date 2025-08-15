import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import AlertContainer, { AlertPosition } from '@/components/ui/AlertContainer';
import { AlertData, AlertType } from '@/components/ui/Alert';

interface AlertContextType {
  alerts: AlertData[];
  showAlert: (alert: Omit<AlertData, 'id'>) => string;
  removeAlert: (id: string) => void;
  clearAllAlerts: () => void;
  // Convenience methods
  showSuccess: (title: string, message?: string, options?: Partial<AlertData>) => string;
  showWarning: (title: string, message?: string, options?: Partial<AlertData>) => string;
  showError: (title: string, message?: string, options?: Partial<AlertData>) => string;
  showInfo: (title: string, message?: string, options?: Partial<AlertData>) => string;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
  position?: AlertPosition;
  maxAlerts?: number;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  position = 'top-right',
  maxAlerts = 5
}) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);

  const generateId = useCallback(() => {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showAlert = useCallback((alertData: Omit<AlertData, 'id'>) => {
    const id = generateId();
    const newAlert: AlertData = {
      id,
      duration: 5000,
      persistent: false,
      ...alertData,
    };

    setAlerts(currentAlerts => {
      const updatedAlerts = [...currentAlerts, newAlert];
      
      // Limit the number of alerts
      if (updatedAlerts.length > maxAlerts) {
        return updatedAlerts.slice(-maxAlerts);
      }
      
      return updatedAlerts;
    });

    return id;
  }, [generateId, maxAlerts]);

  const removeAlert = useCallback((id: string) => {
    setAlerts(currentAlerts => currentAlerts.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<AlertData>) => {
    return showAlert({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<AlertData>) => {
    return showAlert({
      type: 'warning',
      title,
      message,
      duration: 6000, // Slightly longer for warnings
      ...options,
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message?: string, options?: Partial<AlertData>) => {
    return showAlert({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer for errors
      persistent: false, // Allow dismissal even for errors
      ...options,
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<AlertData>) => {
    return showAlert({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [showAlert]);

  const contextValue: AlertContextType = {
    alerts,
    showAlert,
    removeAlert,
    clearAllAlerts,
    showSuccess,
    showWarning,
    showError,
    showInfo,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <AlertContainer
        alerts={alerts}
        position={position}
        onRemove={removeAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Export individual alert functions for global use
let globalAlertContext: AlertContextType | null = null;

export const setGlobalAlertContext = (context: AlertContextType) => {
  globalAlertContext = context;
};

// Global alert functions that can be used anywhere
export const alert = {
  success: (title: string, message?: string, options?: Partial<AlertData>) => {
    if (globalAlertContext) {
      return globalAlertContext.showSuccess(title, message, options);
    }
    console.warn('Alert context not initialized. Using fallback alert.');
    window.alert(`✅ ${title}${message ? `: ${message}` : ''}`);
    return '';
  },
  
  warning: (title: string, message?: string, options?: Partial<AlertData>) => {
    if (globalAlertContext) {
      return globalAlertContext.showWarning(title, message, options);
    }
    console.warn('Alert context not initialized. Using fallback alert.');
    window.alert(`⚠️ ${title}${message ? `: ${message}` : ''}`);
    return '';
  },
  
  error: (title: string, message?: string, options?: Partial<AlertData>) => {
    if (globalAlertContext) {
      return globalAlertContext.showError(title, message, options);
    }
    console.warn('Alert context not initialized. Using fallback alert.');
    window.alert(`❌ ${title}${message ? `: ${message}` : ''}`);
    return '';
  },
  
  info: (title: string, message?: string, options?: Partial<AlertData>) => {
    if (globalAlertContext) {
      return globalAlertContext.showInfo(title, message, options);
    }
    console.warn('Alert context not initialized. Using fallback alert.');
    window.alert(`ℹ️ ${title}${message ? `: ${message}` : ''}`);
    return '';
  },
  
  show: (alert: Omit<AlertData, 'id'>) => {
    if (globalAlertContext) {
      return globalAlertContext.showAlert(alert);
    }
    console.warn('Alert context not initialized. Using fallback alert.');
    const emoji = alert.type === 'success' ? '✅' : alert.type === 'warning' ? '⚠️' : alert.type === 'error' ? '❌' : 'ℹ️';
    window.alert(`${emoji} ${alert.title}${alert.message ? `: ${alert.message}` : ''}`);
    return '';
  }
};