import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, Users, Calendar, Tag } from 'lucide-react';
import { UserGroupData, MyProjectData } from '@/lib/api';

interface SearchAndFilterProps {
  groups: UserGroupData[];
  projects: MyProjectData[];
  onFilteredResults: (filteredGroups: UserGroupData[]) => void;
  onSearchChange?: (searchTerm: string) => void;
}

interface FilterState {
  searchTerm: string;
  status: string[];
  projects: number[];
  memberCountRange: { min: number; max: number };
  permissions: string[];
  dateRange: { start: string; end: string };
  sortBy: 'name' | 'memberCount' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  groups,
  projects,
  onFilteredResults,
  onSearchChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: [],
    projects: [],
    memberCountRange: { min: 0, max: 100 },
    permissions: [],
    dateRange: { start: '', end: '' },
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Available filter options
  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    { value: 'inactive', label: 'Inactive', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' }
  ];

  const permissionOptions = [
    { value: 'project.view', label: 'View Projects' },
    { value: 'project.edit', label: 'Edit Projects' },
    { value: 'project.create', label: 'Create Projects' },
    { value: 'component.view', label: 'View Components' },
    { value: 'component.edit', label: 'Edit Components' },
    { value: 'page.view', label: 'View Pages' },
    { value: 'page.edit', label: 'Edit Pages' },
    { value: 'group.manage', label: 'Manage Groups' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'memberCount', label: 'Member Count' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Updated Date' }
  ];

  useEffect(() => {
    applyFilters();
  }, [filters, groups]);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.memberCountRange.min > 0 || filters.memberCountRange.max < 100) count++;
    if (filters.permissions.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const applyFilters = () => {
    let filtered = [...groups];

    // Apply search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(group =>
        group.name.toLowerCase().includes(term) ||
        group.description?.toLowerCase().includes(term) ||
        group.members?.some(member => 
          member.firstName.toLowerCase().includes(term) ||
          member.lastName.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term)
        )
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(group => 
        filters.status.includes(group.status || 'active')
      );
    }

    // Apply project filter
    if (filters.projects.length > 0) {
      filtered = filtered.filter(group => 
        group.project && filters.projects.includes(group.project.id)
      );
    }

    // Apply member count range
    filtered = filtered.filter(group => {
      const memberCount = group.members?.length || 0;
      return memberCount >= filters.memberCountRange.min && 
             memberCount <= filters.memberCountRange.max;
    });

    // Apply permissions filter
    if (filters.permissions.length > 0) {
      filtered = filtered.filter(group => {
        const groupPermissions = group.permissions || [];
        return filters.permissions.some(permission => 
          groupPermissions.includes(permission)
        );
      });
    }

    // Apply date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(group => {
        const createdAt = new Date(group.createdAt || '');
        const start = filters.dateRange.start ? new Date(filters.dateRange.start) : new Date(0);
        const end = filters.dateRange.end ? new Date(filters.dateRange.end) : new Date();
        
        return createdAt >= start && createdAt <= end;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'memberCount':
          aValue = a.members?.length || 0;
          bValue = b.members?.length || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt || 0);
          bValue = new Date(b.updatedAt || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    onFilteredResults(filtered);
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    onSearchChange?.(value);
  };

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleProjectToggle = (projectId: number) => {
    setFilters(prev => ({
      ...prev,
      projects: prev.projects.includes(projectId)
        ? prev.projects.filter(p => p !== projectId)
        : [...prev.projects, projectId]
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    setFilters(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      status: [],
      projects: [],
      memberCountRange: { min: 0, max: 100 },
      permissions: [],
      dateRange: { start: '', end: '' },
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const clearFilter = (filterType: string) => {
    switch (filterType) {
      case 'search':
        setFilters(prev => ({ ...prev, searchTerm: '' }));
        break;
      case 'status':
        setFilters(prev => ({ ...prev, status: [] }));
        break;
      case 'projects':
        setFilters(prev => ({ ...prev, projects: [] }));
        break;
      case 'memberCount':
        setFilters(prev => ({ ...prev, memberCountRange: { min: 0, max: 100 } }));
        break;
      case 'permissions':
        setFilters(prev => ({ ...prev, permissions: [] }));
        break;
      case 'dateRange':
        setFilters(prev => ({ ...prev, dateRange: { start: '', end: '' } }));
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search groups, members, or descriptions..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sort Controls */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ 
                ...prev, 
                sortBy: sortBy as any, 
                sortOrder: sortOrder as any 
              }));
            }}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            {sortOptions.map(option => (
              <React.Fragment key={option.value}>
                <option value={`${option.value}-asc`}>{option.label} (A-Z)</option>
                <option value={`${option.value}-desc`}>{option.label} (Z-A)</option>
              </React.Fragment>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-3 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
              isFilterOpen || activeFiltersCount > 0
                ? 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${
              isFilterOpen ? 'rotate-180' : ''
            }`} />
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Active filters:</span>
          
          {filters.searchTerm && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs rounded-full">
              Search: "{filters.searchTerm}"
              <button
                onClick={() => clearFilter('search')}
                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.status.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
              Status: {filters.status.join(', ')}
              <button
                onClick={() => clearFilter('status')}
                className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {filters.projects.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-xs rounded-full">
              Projects: {filters.projects.length}
              <button
                onClick={() => clearFilter('projects')}
                className="ml-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {statusOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(option.value)}
                      onChange={() => handleStatusToggle(option.value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`px-2 py-1 text-xs rounded-full ${option.color}`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Projects Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Projects
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {projects.map(project => (
                  <label key={project.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.projects.includes(project.id)}
                      onChange={() => handleProjectToggle(project.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {project.name}
                    </span>
                  </label>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No projects available</p>
                )}
              </div>
            </div>

            {/* Member Count Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Member Count
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.memberCountRange.min}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      memberCountRange: { ...prev.memberCountRange, min: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                    placeholder="Min"
                  />
                  <span className="text-slate-500">to</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={filters.memberCountRange.max}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      memberCountRange: { ...prev.memberCountRange, max: parseInt(e.target.value) || 100 }
                    }))}
                    className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-700 dark:text-white"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Permissions Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Permissions
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {permissionOptions.map(option => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.permissions.includes(option.value)}
                      onChange={() => handlePermissionToggle(option.value)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Created Date Range
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
                />
                <span className="text-slate-500">to</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Clear All
            </button>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;