import React from 'react';
import { Search, Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
  }[];
  placeholder?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchValue = '',
  onSearchChange,
  filters = [],
  placeholder = 'Search...'
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Filters */}
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;