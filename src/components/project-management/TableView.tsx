import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Filter,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Check,
  X,
  Calendar,
  User,
  Flag,
  Clock,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import { useProjectManagement, Task } from '@/contexts/ProjectManagementContext';

interface TableViewProps {
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
}

interface SortConfig {
  key: keyof Task | 'none';
  direction: 'asc' | 'desc';
}

interface ColumnConfig {
  key: keyof Task | 'actions';
  label: string;
  width: number;
  resizable: boolean;
  sortable: boolean;
  editable: boolean;
  type: 'text' | 'date' | 'select' | 'number' | 'progress' | 'actions';
  options?: string[];
}

const TableView: React.FC<TableViewProps> = ({ onTaskClick, onCreateTask }) => {
  const { 
    currentProject, 
    updateTask, 
    deleteTask,
    formatDate 
  } = useProjectManagement();
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'none', direction: 'asc' });
  const [filterText, setFilterText] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: keyof Task } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null);
  
  const tableRef = useRef<HTMLDivElement>(null);

  const columns: ColumnConfig[] = [
    { key: 'title', label: 'Task Name', width: 250, resizable: true, sortable: true, editable: true, type: 'text' },
    { key: 'status', label: 'Status', width: 120, resizable: true, sortable: true, editable: true, type: 'select', options: ['todo', 'in_progress', 'review', 'completed'] },
    { key: 'priority', label: 'Priority', width: 100, resizable: true, sortable: true, editable: true, type: 'select', options: ['low', 'medium', 'high', 'urgent'] },
    { key: 'assignee', label: 'Assignee', width: 150, resizable: true, sortable: true, editable: true, type: 'text' },
    { key: 'startDate', label: 'Start Date', width: 120, resizable: true, sortable: true, editable: true, type: 'date' },
    { key: 'endDate', label: 'End Date', width: 120, resizable: true, sortable: true, editable: true, type: 'date' },
    { key: 'progress', label: 'Progress', width: 100, resizable: true, sortable: true, editable: true, type: 'progress' },
    { key: 'estimatedHours', label: 'Est. Hours', width: 100, resizable: true, sortable: true, editable: true, type: 'number' },
    { key: 'actualHours', label: 'Actual Hours', width: 100, resizable: true, sortable: true, editable: true, type: 'number' },
    { key: 'actions', label: 'Actions', width: 80, resizable: false, sortable: false, editable: false, type: 'actions' }
  ];

  const tasks = currentProject?.tasks || [];

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(filterText.toLowerCase()) ||
      task.description.toLowerCase().includes(filterText.toLowerCase()) ||
      task.assignee.toLowerCase().includes(filterText.toLowerCase()) ||
      task.status.toLowerCase().includes(filterText.toLowerCase()) ||
      task.priority.toLowerCase().includes(filterText.toLowerCase())
    );

    if (sortConfig.key !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Task];
        const bValue = b[sortConfig.key as keyof Task];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [tasks, filterText, sortConfig]);

  // Handle sorting
  const handleSort = (column: keyof Task) => {
    setSortConfig(prev => ({
      key: column,
      direction: prev.key === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle task selection
  const handleTaskSelection = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev =>
      selected
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedTasks(selected ? filteredAndSortedTasks.map(task => task.id) : []);
  };

  // Handle inline editing
  const startEditing = (taskId: string, field: keyof Task, currentValue: any) => {
    setEditingCell({ taskId, field });
    setEditValue(String(currentValue));
  };

  const saveEdit = () => {
    if (!editingCell) return;
    
    const { taskId, field } = editingCell;
    let value: any = editValue;
    
    // Convert value based on field type
    const column = columns.find(col => col.key === field);
    if (column) {
      switch (column.type) {
        case 'number':
          value = parseFloat(editValue) || 0;
          break;
        case 'date':
          value = new Date(editValue);
          break;
        default:
          value = editValue;
      }
    }
    
    updateTask(taskId, { [field]: value });
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  // Handle column resizing
  const startResize = (column: string, e: React.MouseEvent) => {
    const currentWidth = columnWidths[column] || columns.find(col => col.key === column)?.width || 100;
    setResizing({
      column,
      startX: e.clientX,
      startWidth: currentWidth
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;
      
      const diff = e.clientX - resizing.startX;
      const newWidth = Math.max(80, resizing.startWidth + diff);
      
      setColumnWidths(prev => ({
        ...prev,
        [resizing.column]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Get column width
  const getColumnWidth = (column: ColumnConfig) => {
    return columnWidths[column.key as string] || column.width;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'todo':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Render cell content
  const renderCellContent = (task: Task, column: ColumnConfig) => {
    const isEditing = editingCell?.taskId === task.id && editingCell?.field === column.key;
    const value = task[column.key as keyof Task];

    if (isEditing && column.editable) {
      if (column.type === 'select') {
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          >
            {column.options?.map(option => (
              <option key={option} value={option}>
                {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );
      } else if (column.type === 'date') {
        return (
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        );
      } else if (column.type === 'number' || column.type === 'progress') {
        return (
          <input
            type="number"
            min={column.type === 'progress' ? 0 : undefined}
            max={column.type === 'progress' ? 100 : undefined}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        );
      } else {
        return (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit();
              if (e.key === 'Escape') cancelEdit();
            }}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        );
      }
    }

    // Render based on column type
    switch (column.key) {
      case 'status':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        );
      case 'priority':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <Flag className="h-3 w-3 mr-1" />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        );
      case 'startDate':
      case 'endDate':
        return formatDate(value as Date, 'short');
      case 'progress':
        return (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 min-w-8">
              {task.progress}%
            </span>
          </div>
        );
      case 'actions':
        return (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTaskClick(task)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="View Details"
            >
              <Eye className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => startEditing(task.id, 'title', task.title)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Edit"
            >
              <Edit3 className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        );
      default:
        return (
          <span className="truncate" title={String(value)}>
            {String(value)}
          </span>
        );
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Project Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a project to view tasks in table format
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Table View
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredAndSortedTasks.length} of {tasks.length} tasks
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onCreateTask}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white w-64"
            />
          </div>

          {/* Selected tasks info */}
          {selectedTasks.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-sm text-blue-800 dark:text-blue-300">
                {selectedTasks.length} selected
              </span>
              <button
                onClick={() => setSelectedTasks([])}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="flex-1 overflow-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 border-b-2 border-gray-300 dark:border-gray-600">
            <tr>
              <th className="w-12 p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === filteredAndSortedTasks.length && filteredAndSortedTasks.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className="relative p-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                  style={{ width: getColumnWidth(column) }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{column.label}</span>
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key as keyof Task)}
                          className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded p-1"
                        >
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                    {column.resizable && (
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500"
                        onMouseDown={(e) => startResize(column.key as string, e)}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-600">
            {filteredAndSortedTasks.map((task, index) => (
              <tr
                key={task.id}
                className={`hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border-l-2 ${
                  selectedTasks.includes(task.id) 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-blue-500' 
                    : index % 2 === 0 
                      ? 'bg-white dark:bg-gray-800 border-l-transparent' 
                      : 'bg-gray-100 dark:bg-gray-700 border-l-transparent'
                }`}
              >
                <td className="w-12 p-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className="p-3 text-sm text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-600 last:border-r-0"
                    style={{ width: getColumnWidth(column) }}
                    onDoubleClick={() => {
                      if (column.editable && column.key !== 'actions') {
                        startEditing(task.id, column.key as keyof Task, task[column.key as keyof Task]);
                      }
                    }}
                  >
                    {renderCellContent(task, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {filteredAndSortedTasks.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filterText ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedTasks.length > 0 && `${selectedTasks.length} selected`}
        </div>
      </div>
    </div>
  );
};

export default TableView;