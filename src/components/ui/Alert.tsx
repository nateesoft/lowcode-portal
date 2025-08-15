import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info, Bell } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertData {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertProps extends AlertData {
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const Alert: React.FC<AlertProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  persistent = false,
  action,
  onClose,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show animation
    setIsVisible(true);

    // Auto close if not persistent
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const getAlertStyles = () => {
    const baseStyles = "flex items-start space-x-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50/90 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/90 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300`;
      case 'error':
        return `${baseStyles} bg-red-50/90 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300`;
      case 'info':
        return `${baseStyles} bg-blue-50/90 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300`;
      default:
        return `${baseStyles} bg-slate-50/90 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 flex-shrink-0 mt-0.5";
    
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500 dark:text-green-400`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500 dark:text-yellow-400`} />;
      case 'error':
        return <XCircle className={`${iconClass} text-red-500 dark:text-red-400`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
      default:
        return <Bell className={`${iconClass} text-slate-500 dark:text-slate-400`} />;
    }
  };

  const getAnimationClass = () => {
    let animationClass = '';
    
    if (isExiting) {
      animationClass = 'animate-slide-out-right opacity-0';
    } else if (isVisible) {
      animationClass = 'animate-slide-in-right';
    } else {
      animationClass = 'opacity-0 translate-x-full';
    }

    return `transform transition-all duration-300 ease-in-out ${animationClass}`;
  };

  const getProgressBarColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className={`${getAlertStyles()} ${getAnimationClass()} min-w-[320px] max-w-md relative overflow-hidden`}>
      {/* Progress bar for auto-close */}
      {!persistent && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 dark:bg-white/10">
          <div 
            className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      {/* Icon */}
      {getIcon()}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm leading-5">
              {title}
            </h4>
            {message && (
              <p className="mt-1 text-sm opacity-90 leading-5">
                {message}
              </p>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="ml-3 flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action button */}
        {action && (
          <div className="mt-3">
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className="text-sm font-medium underline hover:no-underline transition-all"
            >
              {action.label}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-out-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animate-slide-out-right {
          animation: slide-out-right 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
};

export default Alert;