import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Activity, Award, Clock, PieChart, Filter } from 'lucide-react';
import { UserGroupData } from '@/lib/api';

interface GroupStatisticsProps {
  groups: UserGroupData[];
  onRefresh?: () => void;
}

interface GroupStats {
  totalGroups: number;
  totalMembers: number;
  byStatus: Record<string, number>;
  averageMembersPerGroup: number;
  topGroups: Array<{
    id: number;
    name: string;
    memberCount: number;
    status: string;
  }>;
  byProject: Record<string, number>;
  membershipTrends: Array<{
    date: string;
    count: number;
  }>;
  permissionDistribution: Record<string, number>;
}

const GroupStatistics: React.FC<GroupStatisticsProps> = ({
  groups,
  onRefresh
}) => {
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [activeChart, setActiveChart] = useState<'status' | 'projects' | 'permissions'>('status');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    calculateStats();
  }, [groups]);

  const calculateStats = () => {
    if (!groups || groups.length === 0) {
      setStats(null);
      return;
    }

    const totalGroups = groups.length;
    const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);

    // Calculate by status
    const byStatus: Record<string, number> = {};
    groups.forEach(group => {
      const status = group.status || 'active';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Calculate by project
    const byProject: Record<string, number> = {};
    groups.forEach(group => {
      const projectName = group.project?.name || 'No Project';
      byProject[projectName] = (byProject[projectName] || 0) + 1;
    });

    // Calculate permission distribution
    const permissionDistribution: Record<string, number> = {};
    groups.forEach(group => {
      const permissions = group.permissions || [];
      permissions.forEach(permission => {
        const category = permission.split('.')[0]; // Extract category (e.g., 'project' from 'project.view')
        permissionDistribution[category] = (permissionDistribution[category] || 0) + 1;
      });
    });

    // Get top groups
    const topGroups = groups
      .sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0))
      .slice(0, 5)
      .map(group => ({
        id: group.id || 0,
        name: group.name,
        memberCount: group.members?.length || 0,
        status: group.status || 'active'
      }));

    // Generate mock membership trends (in real app, this would come from historical data)
    const membershipTrends = generateMockTrends(totalMembers, timeRange);

    setStats({
      totalGroups,
      totalMembers,
      byStatus,
      averageMembersPerGroup: totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0,
      topGroups,
      byProject,
      membershipTrends,
      permissionDistribution
    });
  };

  const generateMockTrends = (currentTotal: number, range: string) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const trends = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = Math.floor(Math.random() * 20) - 10; // Random variation
      const count = Math.max(0, currentTotal + variation - Math.floor(Math.random() * 50));
      
      trends.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }
    
    return trends;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const renderChart = () => {
    if (!stats) return null;

    let data: Record<string, number>;
    let title: string;
    let colors: string[];

    switch (activeChart) {
      case 'status':
        data = stats.byStatus;
        title = 'Groups by Status';
        colors = ['#10B981', '#EF4444', '#F59E0B', '#6B7280'];
        break;
      case 'projects':
        data = stats.byProject;
        title = 'Groups by Project';
        colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
        break;
      case 'permissions':
        data = stats.permissionDistribution;
        title = 'Permission Categories';
        colors = ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];
        break;
      default:
        return null;
    }

    const maxValue = Math.max(...Object.values(data));
    const entries = Object.entries(data).slice(0, 5); // Show top 5

    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h4>
        <div className="space-y-3">
          {entries.map(([key, value], index) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-600 dark:text-slate-400 capitalize">{key}</span>
                <span className="font-medium text-slate-900 dark:text-white">{value}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(value / maxValue) * 100}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!stats) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No Statistics Available
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          Create some user groups to see statistics here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Group Statistics
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Analytics and insights for user groups
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalGroups}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Groups
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.totalMembers}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Total Members
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.averageMembersPerGroup}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Avg Members/Group
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.byStatus.active || 0}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Active Groups
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <div className="space-y-4">
          <div className="flex space-x-2">
            {['status', 'projects', 'permissions'].map((chart) => (
              <button
                key={chart}
                onClick={() => setActiveChart(chart as any)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeChart === chart
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {chart.charAt(0).toUpperCase() + chart.slice(1)}
              </button>
            ))}
          </div>
          {renderChart()}
        </div>

        {/* Top Groups */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Top Groups by Members</span>
          </h4>
          <div className="space-y-3">
            {stats.topGroups.map((group, index) => (
              <div key={group.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    index === 1 ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
                    index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      {group.name}
                    </div>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(group.status)}`}>
                      {group.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {group.memberCount}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    members
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership Trends */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="h-4 w-4" />
          <span>Membership Trends</span>
        </h4>
        <div className="h-32 flex items-end space-x-1">
          {stats.membershipTrends.map((trend, index) => {
            const maxCount = Math.max(...stats.membershipTrends.map(t => t.count));
            const height = (trend.count / maxCount) * 100;
            
            return (
              <div
                key={index}
                className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-t hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors relative group"
                style={{ height: `${height}%`, minHeight: '4px' }}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {trend.date}: {trend.count} members
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span>{stats.membershipTrends[0]?.date}</span>
          <span>{stats.membershipTrends[stats.membershipTrends.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
};

export default GroupStatistics;