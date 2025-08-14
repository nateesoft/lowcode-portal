import React, { useState, useRef } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  User, 
  Flag, 
  Calendar,
  Clock,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useProjectManagement, Task } from '@/contexts/ProjectManagementContext';

interface KanbanViewProps {
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
}

interface ColumnConfig {
  id: string;
  title: string;
  status: string;
  color: string;
  maxItems?: number;
}

const KanbanView: React.FC<KanbanViewProps> = ({ onTaskClick, onCreateTask }) => {
  const { 
    currentProject, 
    updateTask, 
    deleteTask,
    formatDate 
  } = useProjectManagement();
  
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const columns: ColumnConfig[] = [
    {
      id: 'todo',
      title: 'To Do',
      status: 'todo',
      color: 'bg-gray-100 border-gray-300 text-gray-700',
    },
    {
      id: 'in_progress',
      title: 'In Progress', 
      status: 'in_progress',
      color: 'bg-blue-100 border-blue-300 text-blue-700',
      maxItems: 3
    },
    {
      id: 'review',
      title: 'Review',
      status: 'review', 
      color: 'bg-yellow-100 border-yellow-300 text-yellow-700',
    },
    {
      id: 'completed',
      title: 'Completed',
      status: 'completed',
      color: 'bg-green-100 border-green-300 text-green-700',
    }
  ];

  const tasks = currentProject?.tasks || [];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    const baseClasses = "h-3 w-3";
    switch (priority) {
      case 'urgent':
        return <Flag className={`${baseClasses} text-red-500`} />;
      case 'high':
        return <Flag className={`${baseClasses} text-orange-500`} />;
      case 'medium':
        return <Flag className={`${baseClasses} text-blue-500`} />;
      case 'low':
        return <Flag className={`${baseClasses} text-gray-500`} />;
      default:
        return <Flag className={`${baseClasses} text-gray-500`} />;
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnId) {
      updateTask(draggedTask.id, { status: columnId });
    }
    setDraggedTask(null);
  };

  const canDropInColumn = (columnId: string, tasksCount: number) => {
    const column = columns.find(col => col.id === columnId);
    return !column?.maxItems || tasksCount < column.maxItems;
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
            Select a project to view tasks in kanban format
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
            Kanban Board
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {tasks.length} tasks total
          </span>
        </div>
        
        <button
          onClick={onCreateTask}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex space-x-4 p-4 h-full min-w-max">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            const canDrop = !draggedTask || canDropInColumn(column.id, columnTasks.length);
            const isOver = dragOverColumn === column.id;
            
            return (
              <div
                key={column.id}
                className={`flex flex-col w-80 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 transition-colors ${
                  isOver && canDrop
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isOver && !canDrop
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-gray-200 dark:border-gray-600 ${column.color} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">
                        {column.title}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full font-medium border border-gray-300 dark:border-gray-600">
                        {columnTasks.length}
                        {column.maxItems && ` / ${column.maxItems}`}
                      </span>
                    </div>
                    <button 
                      onClick={onCreateTask}
                      className="p-1 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Tasks Container */}
                <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className={`p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${getPriorityColor(task.priority)}`}
                      onClick={() => onTaskClick(task)}
                    >
                      {/* Task Header */}
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-1 ml-2">
                          {getPriorityIcon(task.priority)}
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <MoreVertical className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Task Meta Info */}
                      <div className="space-y-2">
                        {/* Assignee */}
                        {task.assignee && (
                          <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                            <User className="h-3 w-3 mr-1" />
                            <span>{task.assignee}</span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                          {task.endDate && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{formatDate(task.endDate, 'short')}</span>
                            </div>
                          )}
                          
                          {task.estimatedHours && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{task.estimatedHours}h</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(task);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700"
                              title="Edit"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-gray-500 hover:text-red-500"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          
                          {task.status !== 'completed' && task.progress === 100 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTask(task.id, { status: 'completed' });
                              }}
                              className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded text-green-600"
                              title="Mark as Complete"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Task Button for Column */}
                  <button
                    onClick={onCreateTask}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Add a task</span>
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer with Stats */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {tasks.length} tasks
        </div>
        <div className="flex items-center space-x-4 text-sm">
          {columns.map((column) => {
            const count = getTasksByStatus(column.status).length;
            return (
              <div key={column.id} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${column.color.split(' ')[0]}`} />
                <span className="text-gray-600 dark:text-gray-400">
                  {column.title}: {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanView;