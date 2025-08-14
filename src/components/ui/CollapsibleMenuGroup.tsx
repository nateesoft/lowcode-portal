import React, { useState } from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
}

interface CollapsibleMenuGroupProps {
  title: string;
  icon?: LucideIcon;
  items: MenuItem[];
  defaultExpanded?: boolean;
  className?: string;
}

const CollapsibleMenuGroup: React.FC<CollapsibleMenuGroupProps> = ({
  title,
  icon: GroupIcon,
  items,
  defaultExpanded = true,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`${className}`}>
      {/* Group Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {GroupIcon && <GroupIcon className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Menu Items */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-1 px-2 pb-2">
          {items.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                onClick={item.onClick}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                    : item.disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                } ${item.isActive ? 'font-medium' : 'font-normal'}`}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-5 w-5 ${
                    item.disabled ? 'opacity-50' : ''
                  }`} />
                  <span className={item.disabled ? 'opacity-50' : ''}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isActive
                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleMenuGroup;