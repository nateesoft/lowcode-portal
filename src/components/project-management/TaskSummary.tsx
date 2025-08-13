import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import { useProjectManagement } from '@/contexts/ProjectManagementContext';

const TaskSummary: React.FC = () => {
  const { currentProject, getTaskSummary } = useProjectManagement();
  
  if (!currentProject) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Project Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a project to view task summary
          </p>
        </div>
      </div>
    );
  }

  const summary = getTaskSummary();
  const tasks = currentProject.tasks;
  
  // Calculate additional metrics
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalActualHours = tasks.reduce((sum, task) => sum + task.actualHours, 0);
  const avgProgress = tasks.length > 0 ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length : 0;
  
  // Get unique assignees
  const uniqueAssignees = Array.from(new Set(tasks.map(task => task.assignee))).filter(assignee => assignee !== 'Unassigned');
  
  // Calculate completion rate
  const completionRate = summary.total > 0 ? (summary.completed / summary.total) * 100 : 0;
  
  // Get priority distribution
  const priorityDistribution = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: summary.total,
      icon: Target,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Completed',
      value: summary.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'In Progress',
      value: summary.inProgress,
      icon: Clock,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Overdue',
      value: summary.overdue,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Upcoming',
      value: summary.upcoming,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Project Summary
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {currentProject.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(completionRate)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(avgProgress)}% Average</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-600`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 ${stat.color} rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Tracking */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Time Tracking
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Hours</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalEstimatedHours}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Actual Hours</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalActualHours}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Remaining</span>
              <span className={`font-semibold ${
                totalActualHours > totalEstimatedHours 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {Math.max(0, totalEstimatedHours - totalActualHours)}h
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Efficiency
                </span>
                <span className={`font-bold ${
                  totalActualHours <= totalEstimatedHours 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {totalEstimatedHours > 0 
                    ? Math.round((totalEstimatedHours / Math.max(totalActualHours, 1)) * 100)
                    : 100}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Priority Distribution
          </h3>
          <div className="space-y-3">
            {[
              { key: 'urgent', label: 'Urgent', color: 'bg-red-500', count: priorityDistribution.urgent },
              { key: 'high', label: 'High', color: 'bg-orange-500', count: priorityDistribution.high },
              { key: 'medium', label: 'Medium', color: 'bg-blue-500', count: priorityDistribution.medium },
              { key: 'low', label: 'Low', color: 'bg-gray-500', count: priorityDistribution.low }
            ].map((priority) => {
              const percentage = summary.total > 0 ? (priority.count / summary.total) * 100 : 0;
              return (
                <div key={priority.key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {priority.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${priority.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {priority.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Team Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Team Members</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {uniqueAssignees.length}
              </span>
            </div>
            
            <div className="space-y-2">
              {uniqueAssignees.slice(0, 5).map((assignee, index) => {
                const assigneeTasks = tasks.filter(task => task.assignee === assignee);
                const completedTasks = assigneeTasks.filter(task => task.status === 'completed').length;
                const assigneeProgress = assigneeTasks.length > 0 ? (completedTasks / assigneeTasks.length) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                        {assignee.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {assignee}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${assigneeProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">
                        {assigneeTasks.length}
                      </span>
                    </div>
                  </div>
                );
              })}
              {uniqueAssignees.length > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                  +{uniqueAssignees.length - 5} more members
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Start Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentProject.startDate.toLocaleDateString('th-TH')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">End Date</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {currentProject.endDate.toLocaleDateString('th-TH')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.ceil((currentProject.endDate.getTime() - currentProject.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            
            {/* Project progress timeline */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Project Progress</span>
                <span>{Math.round(completionRate)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSummary;