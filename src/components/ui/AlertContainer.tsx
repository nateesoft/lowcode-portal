import React from 'react';
import Alert, { AlertData } from './Alert';

export type AlertPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

interface AlertContainerProps {
  alerts: AlertData[];
  position?: AlertPosition;
  onRemove: (id: string) => void;
}

const AlertContainer: React.FC<AlertContainerProps> = ({
  alerts,
  position = 'top-right',
  onRemove
}) => {
  const getPositionClasses = (pos: AlertPosition) => {
    const baseClasses = "fixed z-[10000] pointer-events-none";
    
    switch (pos) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  const isTop = position.includes('top');
  const sortedAlerts = isTop 
    ? [...alerts].reverse() // Latest on top for top positions
    : alerts; // Latest at bottom for bottom positions

  if (alerts.length === 0) return null;

  return (
    <div className={getPositionClasses(position)}>
      <div className={`flex flex-col ${isTop ? 'space-y-2' : 'space-y-2'}`}>
        {sortedAlerts.map((alert) => (
          <div key={alert.id} className="pointer-events-auto">
            <Alert
              {...alert}
              onClose={onRemove}
              position={position}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertContainer;