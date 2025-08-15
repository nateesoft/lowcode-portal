import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  assigneeAvatar?: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  tags: string[];
  dependencies: string[]; // Task IDs this task depends on
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedHours: number;
  actualHours: number;
  comments: TaskComment[];
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
}

export interface ProjectTimeline {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  tasks: Task[];
}

export type ViewMode = 'day' | 'week' | 'month' | 'year';

interface ProjectManagementContextType {
  // State
  projects: ProjectTimeline[];
  currentProject: ProjectTimeline | null;
  selectedTask: Task | null;
  viewMode: ViewMode;
  selectedDate: Date;
  
  // Timeline functions
  setViewMode: (mode: ViewMode) => void;
  setSelectedDate: (date: Date) => void;
  
  // Project functions
  createProject: (projectData: Partial<ProjectTimeline>) => void;
  updateProject: (projectId: string, updates: Partial<ProjectTimeline>) => void;
  deleteProject: (projectId: string) => void;
  setCurrentProject: (project: ProjectTimeline | null) => void;
  
  // Task functions
  createTask: (taskData: Partial<Task>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStartDate: Date, newEndDate: Date) => void;
  setSelectedTask: (task: Task | null) => void;
  
  // Utility functions
  getTasksForDateRange: (startDate: Date, endDate: Date) => Task[];
  getTasksForDate: (date: Date) => Task[];
  getTaskSummary: () => {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    upcoming: number;
  };
  generateDemoData: () => void;
  
  // Date utilities
  formatDate: (date: Date, format?: string) => string;
  getWeekDates: (date: Date) => Date[];
  getMonthDates: (date: Date) => Date[];
  getYearDates: (date: Date) => Date[];
}

const ProjectManagementContext = createContext<ProjectManagementContextType | null>(null);

export const ProjectManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectTimeline[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectTimeline | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Project functions
  const createProject = useCallback((projectData: Partial<ProjectTimeline>) => {
    const newProject: ProjectTimeline = {
      id: Date.now().toString(),
      name: projectData.name || 'New Project',
      description: projectData.description || '',
      startDate: projectData.startDate || new Date(),
      endDate: projectData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      color: projectData.color || '#3B82F6',
      tasks: [],
      ...projectData
    };
    
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<ProjectTimeline>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    ));
    
    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentProject]);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  }, [currentProject]);

  // Task functions
  const createTask = useCallback((taskData: Partial<Task>) => {
    if (!currentProject) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || 'Unassigned',
      assigneeAvatar: taskData.assigneeAvatar,
      startDate: taskData.startDate || new Date(),
      endDate: taskData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: taskData.progress || 0,
      tags: taskData.tags || [],
      dependencies: taskData.dependencies || [],
      projectId: currentProject.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedHours: taskData.estimatedHours || 8,
      actualHours: taskData.actualHours || 0,
      comments: [],
      ...taskData
    };
    
    const updatedProject = {
      ...currentProject,
      tasks: [...currentProject.tasks, newTask]
    };
    
    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedProject.tasks });
  }, [currentProject, updateProject]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    if (!currentProject) return;
    
    const updatedTasks = currentProject.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date() } : task
    );
    
    const updatedProject = { ...currentProject, tasks: updatedTasks };
    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedTasks });
    
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  }, [currentProject, updateProject, selectedTask]);

  const deleteTask = useCallback((taskId: string) => {
    if (!currentProject) return;
    
    const updatedTasks = currentProject.tasks.filter(task => task.id !== taskId);
    const updatedProject = { ...currentProject, tasks: updatedTasks };
    
    setCurrentProject(updatedProject);
    updateProject(currentProject.id, { tasks: updatedTasks });
    
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  }, [currentProject, updateProject, selectedTask]);

  const moveTask = useCallback((taskId: string, newStartDate: Date, newEndDate: Date) => {
    updateTask(taskId, { startDate: newStartDate, endDate: newEndDate });
  }, [updateTask]);

  // Utility functions
  const getTasksForDateRange = useCallback((startDate: Date, endDate: Date): Task[] => {
    if (!currentProject) return [];
    
    return currentProject.tasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      
      return (
        (taskStart >= startDate && taskStart <= endDate) ||
        (taskEnd >= startDate && taskEnd <= endDate) ||
        (taskStart <= startDate && taskEnd >= endDate)
      );
    });
  }, [currentProject]);

  const getTasksForDate = useCallback((date: Date): Task[] => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return getTasksForDateRange(startOfDay, endOfDay);
  }, [getTasksForDateRange]);

  const getTaskSummary = useCallback(() => {
    if (!currentProject) {
      return { total: 0, completed: 0, inProgress: 0, overdue: 0, upcoming: 0 };
    }
    
    const now = new Date();
    const tasks = currentProject.tasks;
    
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const overdue = tasks.filter(task => 
      new Date(task.endDate) < now && task.status !== 'completed'
    ).length;
    const upcoming = tasks.filter(task => 
      new Date(task.startDate) > now
    ).length;
    
    return { total, completed, inProgress, overdue, upcoming };
  }, [currentProject]);

  // Date utilities
  const formatDate = useCallback((date: Date, format = 'short'): string => {
    switch (format) {
      case 'short':
        return date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' });
      case 'medium':
        return date.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
      case 'long':
        return date.toLocaleDateString('th-TH', { 
          weekday: 'long', 
          day: '2-digit', 
          month: 'long' 
        });
      default:
        return date.toLocaleDateString('th-TH');
    }
  }, []);

  const getWeekDates = useCallback((date: Date): Date[] => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    
    return week;
  }, []);

  const getMonthDates = useCallback((date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    
    return dates;
  }, []);

  const getYearDates = useCallback((date: Date): Date[] => {
    const year = date.getFullYear();
    const months = [];
    
    for (let month = 0; month < 12; month++) {
      months.push(new Date(year, month, 1));
    }
    
    return months;
  }, []);

  const generateDemoData = useCallback(() => {
    const demoProject: ProjectTimeline = {
      id: 'demo-project-1',
      name: 'DEVLOOP Development',
      description: 'Lowcode platform development project with multiple phases',
      startDate: new Date(2024, 0, 1),
      endDate: new Date(2024, 11, 31),
      color: '#3B82F6',
      tasks: []
    };

    const demoTasks: Task[] = [
      {
        id: 'task-1',
        title: 'Project Planning & Analysis',
        description: 'Define requirements, create project roadmap, and set up development environment',
        status: 'completed',
        priority: 'high',
        assignee: 'John Doe',
        assigneeAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 15),
        progress: 100,
        tags: ['planning', 'analysis'],
        dependencies: [],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 0, 1),
        updatedAt: new Date(2024, 0, 15),
        estimatedHours: 80,
        actualHours: 75,
        comments: []
      },
      {
        id: 'task-2',
        title: 'UI/UX Design System',
        description: 'Create design system, wireframes, and interactive prototypes',
        status: 'completed',
        priority: 'high',
        assignee: 'Jane Smith',
        assigneeAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b74db695?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 0, 10),
        endDate: new Date(2024, 1, 5),
        progress: 100,
        tags: ['design', 'ui/ux'],
        dependencies: ['task-1'],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 0, 10),
        updatedAt: new Date(2024, 1, 5),
        estimatedHours: 120,
        actualHours: 110,
        comments: []
      },
      {
        id: 'task-3',
        title: 'Database Architecture',
        description: 'Design database schema, implement data models, and set up migrations',
        status: 'in_progress',
        priority: 'high',
        assignee: 'Mike Wilson',
        assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 1, 1),
        endDate: new Date(2024, 2, 15),
        progress: 75,
        tags: ['backend', 'database'],
        dependencies: ['task-1'],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 1, 1),
        updatedAt: new Date(),
        estimatedHours: 100,
        actualHours: 80,
        comments: []
      },
      {
        id: 'task-4',
        title: 'React Components Development',
        description: 'Build reusable components, implement drag & drop functionality',
        status: 'in_progress',
        priority: 'medium',
        assignee: 'Sarah Johnson',
        assigneeAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 1, 15),
        endDate: new Date(2024, 3, 30),
        progress: 60,
        tags: ['frontend', 'react'],
        dependencies: ['task-2'],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 1, 15),
        updatedAt: new Date(),
        estimatedHours: 150,
        actualHours: 95,
        comments: []
      },
      {
        id: 'task-5',
        title: 'API Development',
        description: 'Create REST APIs, implement authentication, and set up middleware',
        status: 'review',
        priority: 'high',
        assignee: 'David Brown',
        assigneeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 2, 1),
        endDate: new Date(2024, 3, 15),
        progress: 90,
        tags: ['backend', 'api'],
        dependencies: ['task-3'],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 2, 1),
        updatedAt: new Date(),
        estimatedHours: 120,
        actualHours: 115,
        comments: []
      },
      {
        id: 'task-6',
        title: 'Testing & QA',
        description: 'Write unit tests, integration tests, and perform quality assurance',
        status: 'todo',
        priority: 'medium',
        assignee: 'Lisa Chen',
        assigneeAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 3, 15),
        endDate: new Date(2024, 4, 30),
        progress: 0,
        tags: ['testing', 'qa'],
        dependencies: ['task-4', 'task-5'],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 3, 15),
        updatedAt: new Date(),
        estimatedHours: 80,
        actualHours: 0,
        comments: []
      },
      {
        id: 'task-7',
        title: 'Deployment & DevOps',
        description: 'Set up CI/CD pipeline, configure production environment',
        status: 'todo',
        priority: 'medium',
        assignee: 'Tom Anderson',
        assigneeAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=32&h=32&fit=crop&crop=face',
        startDate: new Date(2024, 4, 1),
        endDate: new Date(2024, 5, 15),
        progress: 0,
        tags: ['devops', 'deployment'],
        dependencies: ['task-6'],
        projectId: 'demo-project-1',
        createdAt: new Date(2024, 4, 1),
        updatedAt: new Date(),
        estimatedHours: 60,
        actualHours: 0,
        comments: []
      }
    ];

    demoProject.tasks = demoTasks;
    setProjects([demoProject]);
    setCurrentProject(demoProject);
  }, []);

  const value: ProjectManagementContextType = {
    // State
    projects,
    currentProject,
    selectedTask,
    viewMode,
    selectedDate,
    
    // Timeline functions
    setViewMode,
    setSelectedDate,
    
    // Project functions
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    
    // Task functions
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    setSelectedTask,
    
    // Utility functions
    getTasksForDateRange,
    getTasksForDate,
    getTaskSummary,
    generateDemoData,
    
    // Date utilities
    formatDate,
    getWeekDates,
    getMonthDates,
    getYearDates,
  };

  return (
    <ProjectManagementContext.Provider value={value}>
      {children}
    </ProjectManagementContext.Provider>
  );
};

export const useProjectManagement = (): ProjectManagementContextType => {
  const context = useContext(ProjectManagementContext);
  if (!context) {
    throw new Error('useProjectManagement must be used within a ProjectManagementProvider');
  }
  return context;
};