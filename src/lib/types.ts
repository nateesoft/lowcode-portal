export interface Project {
  id: number;
  name: string;
  type: string;
  status: string;
  lastModified: string;
  tasks: number;
  completed: number;
}

export interface Note {
  id: number;
  content: string;
  color: string;
  expiresAt?: Date;
  userId: number;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: number;
  name: string;
  category: string;
  description: string;
  stars: number;
  uses: number;
  icon: string;
}

export interface TierLimit {
  projects: number | string;
  exports: number | string;
  nodes: number | string;
  support: string;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalExports: number;
  activeUsers: number;
  juniorUsers: number;
  seniorUsers: number;
  specialistUsers: number;
}

export type UserRole = 'user' | 'admin';
export type UserTier = 'Junior' | 'Senior' | 'Specialist';
export type PageType = 'landing' | 'login' | 'dashboard' | 'projects' | 'admin' | 'builder' | 'reactflow';
export type AdminViewType = 'overview' | 'users' | 'templates' | 'analytics' | 'logs';

export interface AppState {
  currentPage: PageType;
  isAuthenticated: boolean;
  userRole: UserRole;
  userTier: UserTier;
  darkMode: boolean;
  selectedProject: Project | null;
  showCreateModal: boolean;
  showCreateSmartFlowModal: boolean;
  activeTab: string;
  mobileMenuOpen: boolean;
  mobileSidebarOpen: boolean;
  adminView: AdminViewType;
}