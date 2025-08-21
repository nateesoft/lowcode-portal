import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionButton
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-slate-400 mb-4">
        <Icon className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          {description}
        </p>
        {actionButton && (
          <button 
            onClick={actionButton.onClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center mx-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {actionButton.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;