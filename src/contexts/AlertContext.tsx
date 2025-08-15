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
  showConfirm: (title: string, message?: string, options?: {
    confirmText?: string;
    cancelText?: string;
    confirmType?: 'danger' | 'primary';
  }) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
  position?: AlertPosition;
  maxAlerts?: number;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmText: string;
  cancelText: string;
  confirmType: 'danger' | 'primary';
  resolve?: (value: boolean) => void;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({
  children,
  position = 'top-right',
  maxAlerts = 5
}) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmType: 'primary'
  });

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

  const showConfirm = useCallback((
    title: string, 
    message?: string, 
    options: {
      confirmText?: string;
      cancelText?: string;
      confirmType?: 'danger' | 'primary';
    } = {}
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmType: options.confirmType || 'primary',
        resolve
      });
    });
  }, []);

  const handleConfirmAnswer = useCallback((answer: boolean) => {
    if (confirmDialog.resolve) {
      confirmDialog.resolve(answer);
    }
    setConfirmDialog(prev => ({ ...prev, isOpen: false, resolve: undefined }));
  }, [confirmDialog.resolve]);

  const contextValue: AlertContextType = {
    alerts,
    showAlert,
    removeAlert,
    clearAllAlerts,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    showConfirm,
  };

  return (
    <AlertContext.Provider value={contextValue}>
      {children}
      <AlertContainer
        alerts={alerts}
        position={position}
        onRemove={removeAlert}
      />
      
      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {confirmDialog.title}
              </h3>
              {confirmDialog.message && (
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {confirmDialog.message}
                </p>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleConfirmAnswer(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
                >
                  {confirmDialog.cancelText}
                </button>
                <button
                  onClick={() => handleConfirmAnswer(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    confirmDialog.confirmType === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  },

  confirm: async (title: string, message?: string, options?: {
    confirmText?: string;
    cancelText?: string;
    confirmType?: 'danger' | 'primary';
  }) => {
    if (globalAlertContext) {
      return globalAlertContext.showConfirm(title, message, options);
    }
    console.warn('Alert context not initialized. Using fallback confirm.');
    return window.confirm(`${title}${message ? `\n${message}` : ''}`);
  }
};