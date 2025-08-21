import React from 'react';
import { Edit, Eye, Trash2, Play, History, LucideIcon } from 'lucide-react';

interface ActionButton {
  icon: LucideIcon;
  onClick: () => void;
  title: string;
  color?: 'blue' | 'green' | 'red' | 'slate' | 'purple';
  disabled?: boolean;
}

interface ActionButtonsProps {
  actions: ActionButton[];
  size?: 'sm' | 'md';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  actions, 
  size = 'md' 
}) => {
  const getColorClasses = (color: string = 'slate', disabled: boolean = false) => {
    if (disabled) {
      return 'opacity-50 cursor-not-allowed text-slate-400';
    }

    const colorMap = {
      blue: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      green: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
      red: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
      purple: 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
      slate: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.slate;
  };

  const sizeClasses = size === 'sm' ? 'p-1' : 'p-1.5';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="flex items-center space-x-1">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${sizeClasses} rounded transition ${getColorClasses(action.color, action.disabled)}`}
            title={action.title}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}
    </div>
  );
};

// Pre-configured action buttons
export const createActionButtons = {
  view: (onClick: () => void): ActionButton => ({
    icon: Eye,
    onClick,
    title: 'View',
    color: 'blue'
  }),
  
  edit: (onClick: () => void): ActionButton => ({
    icon: Edit,
    onClick,
    title: 'Edit',
    color: 'green'
  }),
  
  delete: (onClick: () => void): ActionButton => ({
    icon: Trash2,
    onClick,
    title: 'Delete',
    color: 'red'
  }),
  
  play: (onClick: () => void, disabled?: boolean): ActionButton => ({
    icon: Play,
    onClick,
    title: 'Execute',
    color: 'green',
    disabled
  }),
  
  history: (onClick: () => void): ActionButton => ({
    icon: History,
    onClick,
    title: 'History',
    color: 'purple'
  })
};

export default ActionButtons;