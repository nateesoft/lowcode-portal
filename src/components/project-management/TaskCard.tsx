import React from 'react';
import { Clock, User, Flag, AlertCircle, CheckCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { Task } from '@/contexts/ProjectManagementContext';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: (task: Task, e: React.DragEvent) => void;
  compact?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDragStart, compact = false }) => {
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string) => {
    const iconClass = "h-3 w-3";
    switch (status) {
      case 'completed':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case 'in_progress':
        return <PlayCircle className={`${iconClass} text-blue-500`} />;
      case 'review':
        return <PauseCircle className={`${iconClass} text-purple-500`} />;
      case 'todo':
        return <AlertCircle className={`${iconClass} text-gray-500`} />;
      default:
        return <AlertCircle className={`${iconClass} text-gray-500`} />;
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    const iconClass = "h-3 w-3";
    switch (priority) {
      case 'urgent':
        return <Flag className={`${iconClass} text-red-500`} />;
      case 'high':
        return <Flag className={`${iconClass} text-orange-500`} />;
      case 'medium':
        return <Flag className={`${iconClass} text-blue-500`} />;
      case 'low':
        return <Flag className={`${iconClass} text-gray-500`} />;
      default:
        return null;
    }
  };

  // Calculate if task is overdue
  const isOverdue = new Date(task.endDate) < new Date() && task.status !== 'completed';
  
  // Format time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const endDate = new Date(task.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(task, e)}
      onClick={onClick}
      className={`
        relative border-l-4 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md group
        ${getPriorityColor(task.priority)}
        ${isOverdue ? 'ring-2 ring-red-200 dark:ring-red-800' : ''}
        ${compact ? 'p-2' : 'p-3'}
      `}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium text-gray-900 dark:text-white truncate ${
            compact ? 'text-sm' : 'text-base'
          }`}>
            {task.title}
          </h4>
          {!compact && task.description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1 ml-2">
          {getStatusIcon(task.status)}
          {getPriorityIcon(task.priority)}
        </div>
      </div>

      {/* Progress Bar */}
      {task.progress > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Task Details */}
      <div className={`space-y-1 ${compact ? 'space-y-0.5' : 'space-y-1'}`}>
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          {task.assigneeAvatar ? (
            <img
              src={task.assigneeAvatar}
              alt={task.assignee}
              className={`rounded-full ${compact ? 'w-4 h-4' : 'w-5 h-5'}`}
            />
          ) : (
            <User className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
          )}
          <span className={`text-gray-600 dark:text-gray-400 truncate ${
            compact ? 'text-xs' : 'text-sm'
          }`}>
            {task.assignee}
          </span>
        </div>

        {/* Time info */}
        <div className="flex items-center space-x-2">
          <Clock className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-gray-400`} />
          <span className={`${
            isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
          } ${compact ? 'text-xs' : 'text-sm'}`}>
            {getTimeRemaining()}
          </span>
        </div>

        {/* Tags */}
        {!compact && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="inline-block px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Estimated vs Actual Hours */}
      {!compact && (task.estimatedHours > 0 || task.actualHours > 0) && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Est: {task.estimatedHours}h</span>
            <span>Actual: {task.actualHours}h</span>
          </div>
        </div>
      )}

      {/* Overdue indicator */}
      {isOverdue && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}

      {/* Drag handle */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-r opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default TaskCard;