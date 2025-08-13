import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';
import { useProjectManagement, Task, ViewMode } from '@/contexts/ProjectManagementContext';
import TaskCard from './TaskCard';

interface TimelineViewProps {
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ onTaskClick, onCreateTask }) => {
  const {
    currentProject,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    getTasksForDateRange,
    getWeekDates,
    getMonthDates,
    getYearDates,
    formatDate,
    moveTask
  } = useProjectManagement();

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  // Get dates based on view mode
  const getDatesForView = () => {
    switch (viewMode) {
      case 'day':
        return [selectedDate];
      case 'week':
        return getWeekDates(selectedDate);
      case 'month':
        return getMonthDates(selectedDate);
      case 'year':
        return getYearDates(selectedDate);
      default:
        return getWeekDates(selectedDate);
    }
  };

  const dates = getDatesForView();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const tasks = getTasksForDateRange(startDate, endDate);

  // Navigation functions
  const navigateToday = () => {
    setSelectedDate(new Date());
  };

  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1);
        break;
    }
    setSelectedDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    switch (viewMode) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }
    setSelectedDate(newDate);
  };

  // Get view title
  const getViewTitle = () => {
    switch (viewMode) {
      case 'day':
        return formatDate(selectedDate, 'long');
      case 'week':
        const weekStart = dates[0];
        const weekEnd = dates[6];
        return `${formatDate(weekStart, 'medium')} - ${formatDate(weekEnd, 'medium')}`;
      case 'month':
        return selectedDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      case 'year':
        return selectedDate.toLocaleDateString('th-TH', { year: 'numeric' });
      default:
        return '';
    }
  };

  // Get tasks for specific date
  const getTasksForDate = (date: Date): Task[] => {
    if (viewMode === 'year') {
      // For year view, get tasks for the entire month
      const year = date.getFullYear();
      const month = date.getMonth();
      const startOfMonth = new Date(year, month, 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(year, month + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      return tasks.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        
        return (
          (taskStart >= startOfMonth && taskStart <= endOfMonth) ||
          (taskEnd >= startOfMonth && taskEnd <= endOfMonth) ||
          (taskStart <= startOfMonth && taskEnd >= endOfMonth)
        );
      });
    } else {
      // For other views, get tasks for the specific day
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return tasks.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        
        return (
          (taskStart >= startOfDay && taskStart <= endOfDay) ||
          (taskEnd >= startOfDay && taskEnd <= endOfDay) ||
          (taskStart <= startOfDay && taskEnd >= endOfDay)
        );
      });
    }
  };

  // Calculate task position and width for timeline
  const getTaskStyle = (task: Task, date: Date) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);
    
    // Calculate if task spans multiple days
    const taskDurationMs = taskEnd.getTime() - taskStart.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const isMultiDay = taskDurationMs > dayMs;
    
    let left = 0;
    let width = 100;
    
    if (viewMode === 'day' && !isMultiDay) {
      // For single day view, position based on start time
      const startHour = taskStart.getHours() + taskStart.getMinutes() / 60;
      const endHour = taskEnd.getHours() + taskEnd.getMinutes() / 60;
      left = (startHour / 24) * 100;
      width = ((endHour - startHour) / 24) * 100;
    }
    
    return {
      left: `${left}%`,
      width: `${Math.max(width, 10)}%`,
      zIndex: 10
    };
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'review':
        return 'bg-purple-500';
      case 'todo':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Drag and drop handlers
  const handleDragStart = (task: Task, e: React.DragEvent) => {
    setDraggedTask(task);
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTask) return;
    
    // Calculate new dates based on drop position
    const taskDuration = new Date(draggedTask.endDate).getTime() - new Date(draggedTask.startDate).getTime();
    const newStartDate = new Date(date);
    const newEndDate = new Date(date.getTime() + taskDuration);
    
    moveTask(draggedTask.id, newStartDate, newEndDate);
    setDraggedTask(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Timeline View
          </h2>
          {currentProject && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentProject.name}
            </span>
          )}
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

      {/* View Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-4">
          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={navigatePrevious}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={navigateToday}
              className="px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Current view title */}
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {getViewTitle()}
          </h3>
        </div>

        {/* View mode selector */}
        <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg">
          {(['day', 'week', 'month', 'year'] as ViewMode[]).map((mode, index) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${
                index === 0 ? 'rounded-l-lg' : index === 3 ? 'rounded-r-lg' : ''
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Content */}
      <div ref={timelineRef} className="flex-1 overflow-auto">
        <div className="min-w-full">
          {/* Date Headers */}
          <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className={`grid gap-0 ${
              viewMode === 'year' ? 'grid-cols-4' : 'grid-cols-7'
            }`}>
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                >
                  {viewMode === 'year' ? (
                    <>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {date.toLocaleDateString('th-TH', { month: 'short' })}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${
                        date.getMonth() === new Date().getMonth() && 
                        date.getFullYear() === new Date().getFullYear()
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {date.toLocaleDateString('th-TH', { month: 'long' })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        {date.toLocaleDateString('th-TH', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-semibold mt-1 ${
                        date.toDateString() === new Date().toDateString()
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {date.getDate()}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="relative min-h-96">
            <div className={`grid gap-0 h-full ${
              viewMode === 'year' ? 'grid-cols-4' : 'grid-cols-7'
            }`}>
              {dates.map((date, index) => (
                <div
                  key={index}
                  className="relative border-r border-gray-200 dark:border-gray-700 last:border-r-0 min-h-96"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(date, e)}
                >
                  {/* Background for current period */}
                  {viewMode === 'year' ? (
                    // Highlight current month in year view
                    date.getMonth() === new Date().getMonth() && 
                    date.getFullYear() === new Date().getFullYear() && (
                      <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10" />
                    )
                  ) : (
                    // Highlight current day in other views
                    date.toDateString() === new Date().toDateString() && (
                      <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10" />
                    )
                  )}
                  
                  {/* Tasks for this date/month */}
                  <div className="relative p-2 space-y-2">
                    {getTasksForDate(date).map((task, taskIndex) => (
                      <div
                        key={task.id}
                        style={{ marginTop: `${taskIndex * 8}px` }}
                      >
                        <TaskCard
                          task={task}
                          onClick={() => onTaskClick(task)}
                          onDragStart={handleDragStart}
                          compact={viewMode !== 'day'}
                        />
                      </div>
                    ))}
                    
                    {/* Show task count for year view */}
                    {viewMode === 'year' && getTasksForDate(date).length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        +{getTasksForDate(date).length - 3} more tasks
                      </div>
                    )}
                    
                    {/* Drop zone indicator */}
                    {draggedTask && (
                      <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 rounded-lg opacity-50" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;