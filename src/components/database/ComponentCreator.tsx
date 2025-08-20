import React, { useState } from 'react';
import { 
  Puzzle, 
  Code, 
  Download, 
  Eye, 
  Settings2, 
  Database,
  Table as TableIcon,
  List,
  Edit3,
  Plus,
  Trash2
} from 'lucide-react';
import { DatabaseColumn } from '@/contexts/DatabaseContext';

interface CRUDPreview {
  tableName: string;
  columns: DatabaseColumn[];
  sampleData: any[];
  totalRows: number;
  generatedQueries: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
}

interface GeneratedComponent {
  id: string;
  name: string;
  type: 'table' | 'form' | 'detail' | 'list';
  tableName: string;
  columns: DatabaseColumn[];
  queries: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
  componentCode: string;
  createdAt: Date;
}

interface ComponentCreatorProps {
  preview: CRUDPreview;
  onClose: () => void;
  onComponentCreated?: (component: GeneratedComponent) => void;
}

const ComponentCreator: React.FC<ComponentCreatorProps> = ({ 
  preview, 
  onClose, 
  onComponentCreated 
}) => {
  const [componentName, setComponentName] = useState(
    `${preview.tableName.charAt(0).toUpperCase() + preview.tableName.slice(1)}Manager`
  );
  const [selectedType, setSelectedType] = useState<'table' | 'form' | 'detail' | 'list'>('table');
  const [includeOperations, setIncludeOperations] = useState({
    create: true,
    read: true,
    update: true,
    delete: true
  });
  const [styling, setStyling] = useState({
    theme: 'modern',
    colorScheme: 'blue',
    responsive: true,
    animations: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const componentTypes = [
    {
      type: 'table' as const,
      icon: TableIcon,
      name: 'Data Table',
      description: 'Full-featured table with pagination, sorting, and filtering'
    },
    {
      type: 'form' as const,
      icon: Edit3,
      name: 'Form Component',
      description: 'Create and edit form with validation'
    },
    {
      type: 'detail' as const,
      icon: Eye,
      name: 'Detail View',
      description: 'Read-only detailed view of a single record'
    },
    {
      type: 'list' as const,
      icon: List,
      name: 'List View',
      description: 'Compact list view with basic operations'
    }
  ];

  const generateComponentCode = () => {
    const primaryKey = preview.columns.find(col => col.isPrimary)?.name || 'id';
    
    switch (selectedType) {
      case 'table':
        return generateTableComponent();
      case 'form':
        return generateFormComponent();
      case 'detail':
        return generateDetailComponent();
      case 'list':
        return generateListComponent();
      default:
        return generateTableComponent();
    }
  };

  const generateTableComponent = () => {
    const primaryKey = preview.columns.find(col => col.isPrimary)?.name || 'id';
    const displayColumns = preview.columns.filter(col => 
      col.name !== primaryKey || includeOperations.read
    );

    return `import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Filter } from 'lucide-react';

interface ${componentName}Props {
  data?: any[];
  onEdit?: (item: any) => void;
  onCreate?: () => void;
  onDelete?: (id: any) => void;
  onRefresh?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data = [],
  onEdit,
  onCreate,
  onDelete,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('${primaryKey}');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            ${preview.tableName.charAt(0).toUpperCase() + preview.tableName.slice(1)} Management
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            ${includeOperations.create ? `
            <button
              onClick={onCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add New</span>
            </button>` : ''}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr>
              ${displayColumns.map(col => `
              <th
                className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === '${col.name}') {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy('${col.name}');
                    setSortOrder('asc');
                  }
                }}
              >
                ${col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' ')}
              </th>`).join('')}
              ${includeOperations.update || includeOperations.delete ? `
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>` : ''}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {paginatedData.map((item, index) => (
              <tr key={item.${primaryKey} || index} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                ${displayColumns.map(col => `
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                  {item.${col.name} === null ? (
                    <span className="text-slate-400 italic">NULL</span>
                  ) : (
                    String(item.${col.name})
                  )}
                </td>`).join('')}
                ${includeOperations.update || includeOperations.delete ? `
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    ${includeOperations.update ? `
                    <button
                      onClick={() => onEdit?.(item)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      <Edit className="h-4 w-4" />
                    </button>` : ''}
                    ${includeOperations.delete ? `
                    <button
                      onClick={() => onDelete?.(item.${primaryKey})}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>` : ''}
                  </div>
                </td>` : ''}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ${componentName};`;
  };

  const generateFormComponent = () => {
    const fields = preview.columns.filter(col => !col.isPrimary);
    
    return `import React, { useState } from 'react';
import { Save, X } from 'lucide-react';

interface ${componentName}Props {
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  initialData = {},
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState(${JSON.stringify(
    fields.reduce((acc, col) => {
      acc[col.name] = '';
      return acc;
    }, {} as any), null, 4
  )});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    ${fields.filter(col => !col.nullable).map(col => `
    if (!formData.${col.name}?.toString().trim()) {
      newErrors.${col.name} = '${col.name.charAt(0).toUpperCase() + col.name.slice(1)} is required';
    }`).join('')}

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave?.(formData);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {initialData?.id ? 'Edit' : 'Create'} ${preview.tableName.charAt(0).toUpperCase() + preview.tableName.slice(1)}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        ${fields.map(col => `
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            ${col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' ')}
            ${!col.nullable ? ' *' : ''}
          </label>
          <input
            type="${col.type.includes('INT') || col.type.includes('DECIMAL') || col.type.includes('FLOAT') ? 'number' : 
                  col.type.includes('DATE') || col.type.includes('TIME') ? 'datetime-local' : 
                  col.type.includes('BOOL') ? 'checkbox' : 'text'}"
            value={formData.${col.name}}
            onChange={(e) => handleChange('${col.name}', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            ${!col.nullable ? 'required' : ''}
          />
          {errors.${col.name} && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.${col.name}}</p>
          )}
        </div>`).join('')}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};`;
  };

  const generateDetailComponent = () => {
    const primaryKey = preview.columns.find(col => col.isPrimary)?.name || 'id';
    
    return `import React from 'react';
import { Edit, ArrowLeft } from 'lucide-react';

interface ${componentName}Props {
  data: any;
  onEdit?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data,
  onEdit,
  onBack,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ${preview.tableName.charAt(0).toUpperCase() + preview.tableName.slice(1)} Details
            </h3>
          </div>
          ${includeOperations.update ? `
          <button
            onClick={onEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>` : ''}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${preview.columns.map(col => `
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              ${col.name.charAt(0).toUpperCase() + col.name.slice(1).replace(/_/g, ' ')}
            </label>
            <div className="text-slate-900 dark:text-white">
              {data?.${col.name} === null ? (
                <span className="text-slate-400 italic">Not set</span>
              ) : data?.${col.name} === undefined ? (
                <span className="text-slate-400 italic">Loading...</span>
              ) : (
                String(data.${col.name})
              )}
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};`;
  };

  const generateListComponent = () => {
    const primaryKey = preview.columns.find(col => col.isPrimary)?.name || 'id';
    const displayFields = preview.columns.slice(0, 3); // Show first 3 fields
    
    return `import React, { useState } from 'react';
import { Search, Plus, Edit, Eye } from 'lucide-react';

interface ${componentName}Props {
  data?: any[];
  onEdit?: (item: any) => void;
  onView?: (item: any) => void;
  onCreate?: () => void;
  isLoading?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data = [],
  onEdit,
  onView,
  onCreate,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            ${preview.tableName.charAt(0).toUpperCase() + preview.tableName.slice(1)} List
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            ${includeOperations.create ? `
            <button
              onClick={onCreate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>` : ''}
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No items found</p>
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div key={item.${primaryKey} || index} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  ${displayFields.map((col, idx) => `
                  <div className="${idx === 0 ? 'text-slate-900 dark:text-white font-medium' : 'text-sm text-slate-600 dark:text-slate-400'}">
                    ${idx === 0 ? '' : `${col.name.charAt(0).toUpperCase() + col.name.slice(1)}: `}
                    {item.${col.name} === null ? (
                      <span className="italic">Not set</span>
                    ) : (
                      String(item.${col.name})
                    )}
                  </div>`).join('')}
                </div>
                <div className="flex items-center space-x-2">
                  ${includeOperations.read ? `
                  <button
                    onClick={() => onView?.(item)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>` : ''}
                  ${includeOperations.update ? `
                  <button
                    onClick={() => onEdit?.(item)}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>` : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ${componentName};`;
  };

  const handleGenerateComponent = async () => {
    setIsGenerating(true);
    
    try {
      const code = generateComponentCode();
      setGeneratedCode(code);
      
      const component: GeneratedComponent = {
        id: `${preview.tableName}_${selectedType}_${Date.now()}`,
        name: componentName,
        type: selectedType,
        tableName: preview.tableName,
        columns: preview.columns,
        queries: preview.generatedQueries,
        componentCode: code,
        createdAt: new Date()
      };

      onComponentCreated?.(component);
    } catch (error) {
      console.error('Failed to generate component:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadComponent = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentName}.tsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Puzzle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Component Creator</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create draggable components from {preview.tableName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
            {/* Configuration Panel */}
            <div className="space-y-6 overflow-y-auto">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Component Configuration
                </h3>
                
                {/* Component Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Component Name
                  </label>
                  <input
                    type="text"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Enter component name..."
                  />
                </div>

                {/* Component Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Component Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {componentTypes.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => setSelectedType(type.type)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          selectedType === type.type
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <type.icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {type.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operations */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Include Operations
                  </label>
                  <div className="space-y-2">
                    {Object.entries(includeOperations).map(([operation, enabled]) => (
                      <label key={operation} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => 
                            setIncludeOperations(prev => ({
                              ...prev,
                              [operation]: e.target.checked
                            }))
                          }
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                          {operation}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateComponent}
                  disabled={isGenerating || !componentName.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Code className="h-4 w-4" />
                  <span>{isGenerating ? 'Generating...' : 'Generate Component'}</span>
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Generated Code Preview
                </h3>
                {generatedCode && (
                  <button
                    onClick={downloadComponent}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {generatedCode ? (
                  <div className="h-full">
                    <pre className="h-full overflow-auto p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200">
                      <code>{generatedCode}</code>
                    </pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-400">
                    <Settings2 className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Code Generated</p>
                    <p className="text-sm text-center">
                      Configure your component settings and click "Generate Component" to see the code
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCreator;