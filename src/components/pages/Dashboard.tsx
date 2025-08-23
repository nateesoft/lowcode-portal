import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Code2, Layers, Settings, Users, LogOut, Bell, Moon, Sun, Home, 
  Plus, Edit, Eye, Trash2, TrendingUp, Activity, Shield, Award, 
  Menu, Check, Zap, Globe, Smartphone, Cpu, Component, ServerIcon, Play,
  Globe2, MessageCircle, Database, Images, Calendar, Table, FileText, Key, Clock,
  Wrench, FolderOpen, Cog, History, Filter, Search
} from 'lucide-react';
import { Project, UserRole, UserTier } from '@/lib/types';
import SiteMap from '@/components/ui/SiteMap';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import { useTranslation } from 'react-i18next';
import WeUIModal from '@/components/modals/WeUIModal';
import ServiceFlowModal from '@/components/modals/ServiceFlowModal';
import PlanUpgradeModal from '@/components/modals/PlanUpgradeModal';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useDatabase, DatabaseConnection } from '@/contexts/DatabaseContext';
import { useMedia } from '@/contexts/MediaContext';
import { useProjectManagement } from '@/contexts/ProjectManagementContext';
import { 
  DatabaseConnectionCard, 
  DatabaseConnectionModal, 
  DatabaseTablesView,
  DatabaseQueryView
} from '@/components/database';
import MediaBreadcrumbs from '@/components/media/MediaBreadcrumbs';
import MediaToolbar from '@/components/media/MediaToolbar';
import MediaGridView from '@/components/media/MediaGridView';
import MediaListView from '@/components/media/MediaListView';
import MediaUploadArea from '@/components/media/MediaUploadArea';
import FolderModal from '@/components/media/FolderModal';
import FilePreviewModal from '@/components/media/FilePreviewModal';
import { 
  TimelineView,
  TableView,
  KanbanView, 
  TaskDetailModal, 
  TaskSummary 
} from '@/components/project-management';
import { 
  DocumentationView 
} from '@/components/documentation';
import {
  SecretKeyCard,
  SecretKeyModal
} from '@/components/secret-management';
import { useSecretManagement } from '@/contexts/SecretManagementContext';
import CollapsibleMenuGroup from '@/components/ui/CollapsibleMenuGroup';
import NotesBoard from '@/components/ui/NotesBoard';
import { serviceAPI, ServiceResponse, componentAPI, ComponentData, ComponentStats, CreateComponentRequest, pageAPI, PageData, PageStats, CreatePageRequest, myProjectAPI, MyProjectData } from '@/lib/api';
import { useAlertActions } from '@/hooks/useAlert';
import { useAlert } from '@/contexts/AlertContext';
import AlertDemo from '@/components/ui/AlertDemo';
import ComponentBuilderModal from '@/components/modals/ComponentBuilderModal';
import ComponentHistoryPanel from '@/components/panels/ComponentHistoryPanel';
import PageModal from '@/components/modals/PageModal';
import PageHistoryPanel from '@/components/panels/PageHistoryPanel';
import MyProjectModal from '@/components/modals/MyProjectModal';
import { useAuth } from '@/contexts/AuthContext';
import UserGroups from '@/components/pages/UserGroups';

interface DashboardProps {
  projects: Project[];
  userRole: UserRole;
  userTier: UserTier;
  darkMode: boolean;
  mobileSidebarOpen: boolean;
  showCreateModal: boolean;
  selectedProject: Project | null;
  setMobileSidebarOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
  setSelectedProject: (project: Project | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  onShowCreateSmartFlowModal?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  userRole,
  userTier,
  darkMode,
  mobileSidebarOpen,
  showCreateModal,
  selectedProject: _selectedProject,
  setMobileSidebarOpen,
  setDarkMode,
  setShowCreateModal,
  setSelectedProject,
  setIsAuthenticated,
  onShowCreateSmartFlowModal
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { openChatbot } = useChatbot();
  const { alert } = useAlertActions();
  const { showConfirm } = useAlert();
  const { logout, user } = useAuth();
  const { 
    connections, 
    isLoading: dbLoading, 
    error: dbError,
    addConnection,
    updateConnection,
    deleteConnection,
    testConnection
  } = useDatabase();
  const {
    viewMode,
    currentFolder
  } = useMedia();
  const {
    currentProject,
    generateDemoData: generateDemoProjects
  } = useProjectManagement();
  const {
    secrets,
    addSecret,
    updateSecret,
    deleteSecret,
    generateDemoSecrets,
    getExpiredSecrets,
    getExpiringSoonSecrets
  } = useSecretManagement();
  
  const [showSiteMap, setShowSiteMap] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [showWeUIModal, setShowWeUIModal] = useState(false);
  const [showServiceFlowModal, setShowServiceFlowModal] = useState(false);
  const [showPlanUpgradeModal, setShowPlanUpgradeModal] = useState(false);
  const [flows, setFlows] = useState<ServiceResponse[]>([]);
  const [editingFlow, setEditingFlow] = useState<ServiceResponse | null>(null);
  
  // Load services when services view is active
  React.useEffect(() => {
    if (activeView === 'services') {
      loadServices();
    }
  }, [activeView]);

  const loadServices = async () => {
    setComponentsLoading(true);
    try {
      const [servicesData] = await Promise.all([
        serviceAPI.getAll()
      ])
      setFlows(servicesData);
    } catch (error) {
      console.error('Error loading services:', error);
      alert.error('Failed to load services');
    } finally {
      setComponentsLoading(false);
    }
  };

  // Component Management functions
  const loadComponents = async () => {
    setComponentsLoading(true);
    try {
      const [componentsData, statsData] = await Promise.all([
        componentAPI.getAll(),
        componentAPI.getStats()
      ]);
      setComponents(componentsData);
      setComponentStats(statsData);
    } catch (error) {
      console.error('Error loading components:', error);
      alert.error('Failed to load components');
    } finally {
      setComponentsLoading(false);
    }
  };

  const handleCreateComponent = () => {
    setEditingComponent(null);
    setShowComponentModal(true);
  };

  const handleEditComponent = (component: ComponentData) => {
    setEditingComponent(component);
    setShowComponentModal(true);
  };

  const handleSaveComponent = async (componentData: CreateComponentRequest) => {
    try {
      if (editingComponent) {
        await componentAPI.update(editingComponent.id!, { ...componentData, userId: user?.id || 1 });
        alert.success('Component updated successfully!');
      } else {
        await componentAPI.create({ ...componentData, userId: user?.id || 1 });
        alert.success('Component created successfully!');
      }
      await loadComponents();
    } catch (error) {
      console.error('Error saving component:', error);
      throw error;
    }
  };

  const handleDeleteComponent = async (componentId: number) => {
    const confirmed = await showConfirm(
      'Delete Component',
      'Are you sure you want to delete this component?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await componentAPI.delete(componentId);
      alert.success('Component deleted successfully!');
      await loadComponents();
    } catch (error) {
      console.error('Error deleting component:', error);
      alert.error('Failed to delete component');
    }
  };

  const handleShowComponentHistory = (component: ComponentData) => {
    setSelectedComponentForHistory(component);
    setShowComponentHistory(true);
  };

  const getFilteredComponents = () => {
    return components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(componentSearchTerm.toLowerCase()) ||
                           component.description?.toLowerCase().includes(componentSearchTerm.toLowerCase()) ||
                           component.tags?.some(tag => tag.toLowerCase().includes(componentSearchTerm.toLowerCase()));
      
      const matchesCategory = componentCategoryFilter === 'all' || component.category === componentCategoryFilter;
      const matchesType = componentTypeFilter === 'all' || component.type === componentTypeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  };

  useEffect(() => {
    if (activeView === 'components') {
      loadComponents();
    }
  }, [activeView]);

  // Page Management functions
  const loadPages = async () => {
    setPagesLoading(true);
    try {
      const [pagesData, statsData] = await Promise.all([
        pageAPI.getAll(),
        pageAPI.getStats()
      ]);
      setPages(pagesData);
      setPageStats(statsData);
    } catch (error) {
      console.error('Error loading pages:', error);
      alert.error('Failed to load pages');
    } finally {
      setPagesLoading(false);
    }
  };

  const handleCreatePage = () => {
    setEditingPage(null);
    setShowPageModal(true);
  };

  const handleEditPage = (page: PageData) => {
    setEditingPage(page);
    setShowPageModal(true);
  };

  const handleSavePage = async (pageData: CreatePageRequest) => {
    try {
      if (editingPage) {
        await pageAPI.update(editingPage.id!, { ...pageData, userId: user?.id || 1 });
        alert.success('Page updated successfully!');
      } else {
        await pageAPI.create({ ...pageData, userId: user?.id || 1 });
        alert.success('Page created successfully!');
      }
      await loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
      throw error;
    }
  };

  const handleDeletePage = async (pageId: number) => {
    const confirmed = await showConfirm(
      'Delete Page',
      'Are you sure you want to delete this page?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await pageAPI.delete(pageId);
      alert.success('Page deleted successfully!');
      await loadPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      alert.error('Failed to delete page');
    }
  };

  const handleShowPageHistory = (page: PageData) => {
    setSelectedPageForHistory(page);
    setShowPageHistory(true);
  };

  const getFilteredPages = () => {
    return pages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(pageSearchTerm.toLowerCase()) ||
                           page.description?.toLowerCase().includes(pageSearchTerm.toLowerCase()) ||
                           page.tags?.some(tag => tag.toLowerCase().includes(pageSearchTerm.toLowerCase()));
      
      const matchesStatus = pageStatusFilter === 'all' || page.status === pageStatusFilter;
      const matchesType = pageTypeFilter === 'all' || page.pageType === pageTypeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  };

  useEffect(() => {
    if (activeView === 'pages') {
      loadPages();
    }
  }, [activeView]);

  // Load My Projects
  const loadMyProjects = async () => {
    try {
      const projectsData = await myProjectAPI.getAll();
      setMyProjects(projectsData);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      alert.error('Failed to load projects');
    }
  };

  useEffect(() => {
    if (activeView === 'projects') {
      loadMyProjects();
    }
  }, [activeView]);

  // Delete project function
  const handleDeleteProject = async (projectId: number) => {
    const confirmed = await showConfirm(
      'Delete Project',
      'Are you sure you want to delete this project?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (confirmed) {
      try {
        await myProjectAPI.delete(projectId);
        setMyProjects(prev => prev.filter(p => p.id !== projectId));
        alert.success('Project deleted successfully');
      } catch (error: any) {
        console.error('Error deleting project:', error);
        alert.error('Failed to delete project');
      }
    }
  };
  
  // Database states
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<any>(null);
  const [viewingTablesConnection, setViewingTablesConnection] = useState<any>(null);
  const [queryingConnection, setQueryingConnection] = useState<any>(null);
  
  // Media states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  // const [editingFile, setEditingFile] = useState<any>(null);
  
  // Component Management states
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [componentStats, setComponentStats] = useState<ComponentStats | null>(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentData | null>(null);
  const [showComponentHistory, setShowComponentHistory] = useState(false);
  const [selectedComponentForHistory, setSelectedComponentForHistory] = useState<ComponentData | null>(null);
  const [componentSearchTerm, setComponentSearchTerm] = useState('');
  const [componentCategoryFilter, setComponentCategoryFilter] = useState<string>('all');
  const [componentTypeFilter, setComponentTypeFilter] = useState<string>('all');
  const [componentsLoading, setComponentsLoading] = useState(false);
  
  // Page Management states
  const [pages, setPages] = useState<PageData[]>([]);
  const [pageStats, setPageStats] = useState<PageStats | null>(null);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [showPageHistory, setShowPageHistory] = useState(false);
  const [selectedPageForHistory, setSelectedPageForHistory] = useState<PageData | null>(null);
  const [pageSearchTerm, setPageSearchTerm] = useState('');
  const [pageStatusFilter, setPageStatusFilter] = useState<string>('all');
  const [pageTypeFilter, setPageTypeFilter] = useState<string>('all');
  const [pagesLoading, setPagesLoading] = useState(false);
  
  // Project Management states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [projectManagementView, setProjectManagementView] = useState<'timeline' | 'table' | 'kanban' | 'summary'>('timeline');
  
  // Secret Management states
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [editingSecret, setEditingSecret] = useState<any>(null);
  const [secretSearchQuery, setSecretSearchQuery] = useState('');
  
  // My Project states
  const [showMyProjectModal, setShowMyProjectModal] = useState(false);
  const [myProjects, setMyProjects] = useState<MyProjectData[]>([]);
  const [secretTypeFilter, setSecretTypeFilter] = useState<string>('all');
  const stats = {
    totalProjects: projects.length,
    published: projects.filter(p => p.status === 'Published').length,
    totalTasks: projects.reduce((acc, p) => acc + p.tasks, 0),
    completedTasks: projects.reduce((acc, p) => acc + p.completed, 0),
  };

  const renderContent = () => {
    switch (activeView) {
      case 'projects':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('myProjects')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  ภาพรวมการทำงานทั้งหมดภายใน Project
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => setShowMyProjectModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createProject')}
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              {myProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <Layers className="h-12 w-12 mx-auto mb-4" />
                    <p>No projects found. Create your first project to get started!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myProjects.map(project => (
                    <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                         onClick={() => router.push(`/reactflow?projectId=${project.id}`)}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                            {project.projectType}
                          </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        project.status === 'production' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : project.status === 'development'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    {/* Project Description */}
                    {project.description && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            router.push(`/reactflow?projectId=${project.id}`); 
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Open WorkFlow"
                        >
                          <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            window.open(`/project/${project.slug}`, '_blank'); 
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Preview Project"
                        >
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteProject(project.id); 
                          }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'pages':
        const filteredPages = getFilteredPages();
        const uniqueStatuses = [...new Set(pages.map(p => p.status))];
        const uniquePageTypes = [...new Set(pages.map(p => p.pageType))];

        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Page Management</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  สร้างและจัดการหน้าเว็บสำหรับ lowcode platform
                </p>
              </div>
              <button
                onClick={handleCreatePage}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </button>
            </div>

            {/* Stats Cards */}
            {pageStats && (
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Pages</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{pageStats.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Published</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{pageStats.published}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Edit className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Drafts</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{pageStats.draft}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Public</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{pageStats.publicPages}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search pages..."
                      value={pageSearchTerm}
                      onChange={(e) => setPageSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={pageStatusFilter}
                    onChange={(e) => setPageStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={pageTypeFilter}
                    onChange={(e) => setPageTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    {uniquePageTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pages List */}
            <div className="p-4 sm:p-6">
              {pagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Loading pages...</span>
                </div>
              ) : filteredPages.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {pageSearchTerm || pageStatusFilter !== 'all' || pageTypeFilter !== 'all'
                      ? 'No Pages Found'
                      : 'No Pages Yet'
                    }
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {pageSearchTerm || pageStatusFilter !== 'all' || pageTypeFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Get started by creating your first page for the lowcode platform.'
                    }
                  </p>
                  {(!pageSearchTerm && pageStatusFilter === 'all' && pageTypeFilter === 'all') && (
                    <button
                      onClick={handleCreatePage}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Create First Page
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPages.map(page => (
                    <div key={page.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white mb-1">{page.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">/{page.slug}</p>
                          {page.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{page.description}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ml-2 ${
                          page.status === 'published' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : page.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {page.status}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{page.pageType}</span>
                        {page.isPublic && (
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Public</span>
                        )}
                        {page.tags && page.tags.length > 0 && (
                          <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                            +{page.tags.length} tags
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>v{page.version || '1.0.0'}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEditPage(page)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-blue-600 dark:text-blue-400"
                            title="Edit page"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleShowPageHistory(page)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-purple-600 dark:text-purple-400"
                            title="View history"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePage(page.id!)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-red-600 dark:text-red-400"
                            title="Delete page"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('services')}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  สร้างและจัดการ APIs ในระบบ
                </p>
              </div>
              <button 
                onClick={() => setShowServiceFlowModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('newService')}
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {flows.length === 0 ? (
                <div className="text-center py-12">
                  <ServerIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Service Flows
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Create your first service flow to manage your application logic
                  </p>
                  <button 
                    onClick={() => setShowServiceFlowModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    Create Your First Flow
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flows.map((flow, index) => (
                    <div key={flow.id || index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                            <ServerIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <div className="font-medium text-slate-900 dark:text-white">{flow.name}</div>
                              {flow.version && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                                  v{flow.version}
                                </span>
                              )}
                              {flow.serviceType && (
                                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-xs">
                                  {flow.serviceType.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {flow.nodes?.length || 0} nodes
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          flow.isActive 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                        }`}>
                          {flow.isActive ? 'active' : 'inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Created {new Date(flow.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={async () => {
                              try {
                                alert.apiSuccess('execute', `Service "${flow.name}" is ready to execute`);
                              } catch (error: any) {
                                console.error('Service execution error:', error);
                                alert.apiError('execute', error.message);
                              }
                            }}
                            disabled={!flow.isActive}
                            className={`p-1 rounded ${
                              flow.isActive
                                ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-green-600 dark:text-green-400'
                                : 'opacity-50 cursor-not-allowed text-slate-400'
                            }`}
                            title="Execute Service"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingFlow(flow);
                              setShowServiceFlowModal(true);
                            }}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            title="Edit Service"
                          >
                            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (await showConfirm(`Are you sure you want to delete "${flow.name}"?`, 'This action cannot be undone.', {
                                confirmText: 'Delete',
                                cancelText: 'Cancel',
                                confirmType: 'danger'
                              })) {
                                try {
                                  await serviceAPI.delete(flow.id);
                                  alert.apiSuccess('delete');
                                  loadServices(); // Refresh the list
                                } catch (error: any) {
                                  console.error('Delete error:', error);
                                  alert.apiError('delete', error.response?.data?.message || error.message);
                                }
                              }
                            }}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                            title="Delete Service"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Settings</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" defaultValue="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" defaultValue="Acme Corp" />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preferences</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Dark Mode</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Switch between light and dark theme</div>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-slate-200'} transition-colors`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Email Notifications</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Receive email notifications for updates</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return userRole === 'admin' ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Management</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                      <th className="pb-4">User</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Last Active</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
                      { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
                      { name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive', lastActive: '1 week ago' }
                    ].map((user, index) => (
                      <tr key={index} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            user.status === 'Active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.lastActive}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null;

      case 'analytics':
        return userRole === 'admin' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    12%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">1,234</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    8%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">89.2%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">System Uptime</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    24%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">45.6K</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Page Views</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ServerIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-red-600 dark:text-red-400">-5%</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">156</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">API Calls</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {[
                    { action: 'New user registered', user: 'john@example.com', time: '2 hours ago', type: 'user' },
                    { action: 'Project deployed', user: 'jane@example.com', time: '4 hours ago', type: 'deployment' },
                    { action: 'System backup completed', user: 'System', time: '6 hours ago', type: 'system' },
                    { action: 'API key generated', user: 'bob@example.com', time: '1 day ago', type: 'security' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.type === 'deployment' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'system' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <Activity className={`h-4 w-4 ${
                          activity.type === 'user' ? 'text-blue-600 dark:text-blue-400' :
                          activity.type === 'deployment' ? 'text-green-600 dark:text-green-400' :
                          activity.type === 'system' ? 'text-purple-600 dark:text-purple-400' :
                          'text-orange-600 dark:text-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">{activity.action}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{activity.user}</div>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Alert System Demo */}
            <AlertDemo />
          </div>
        ) : null;

      case 'database':
        if (queryingConnection) {
          return (
            <div className="h-full">
              <DatabaseQueryView 
                connection={queryingConnection} 
              />
              {/* Back button */}
              <div className="absolute top-4 left-4 z-10">
                <button
                  onClick={() => setQueryingConnection(null)}
                  className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  <span>←</span>
                  <span>Back to Connections</span>
                </button>
              </div>
            </div>
          );
        }

        if (viewingTablesConnection) {
          return (
            <DatabaseTablesView
              connection={viewingTablesConnection}
              onBack={() => setViewingTablesConnection(null)}
            />
          );
        }

        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Database Connections</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage your database connections and schemas
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => setShowConnectionModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connection
                </button>
                <button 
                  onClick={() => setShowConnectionModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Connection
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {dbError && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{dbError}</p>
                </div>
              )}
              
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Database Connections
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Connect to your databases to manage data and run queries
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => setShowConnectionModal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Add Your First Connection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {connections.map(connection => (
                    <DatabaseConnectionCard
                      key={connection.id}
                      connection={connection}
                      onEdit={(conn) => {
                        setEditingConnection(conn);
                        setShowConnectionModal(true);
                      }}
                      onDelete={async (id: string) => await deleteConnection(Number(id))}
                      onTest={async (conn: DatabaseConnection) => {
                        try {
                          console.log('Testing connection from Dashboard:', conn);
                          const result = await testConnection(conn.id);
                          console.log('Test result:', result);
                          if (result) {
                            alert.success(`Connection "${conn.name}" tested successfully!`);
                          } else {
                            alert.error(`Connection test failed for "${conn.name}"`);
                          }
                        } catch (error: any) {
                          console.error('Test connection error in Dashboard:', error);
                          alert.error(`Error testing connection: ${error.message}`);
                        }
                      }}
                      onConnect={(conn) => {
                        setQueryingConnection(conn);
                      }}
                      onViewTables={(conn) => setViewingTablesConnection(conn)}
                      isLoading={dbLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'media':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Media Breadcrumbs */}
            <MediaBreadcrumbs />
            
            {/* Media Toolbar */}
            <MediaToolbar 
              onCreateFolder={() => {
                setEditingFolder(null);
                setShowFolderModal(true);
              }}
              onUpload={() => {
                // Upload will be handled by MediaUploadArea
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
            />
            
            {/* Media Content */}
            <div className="flex-1">
              {!currentFolder && (
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Quick Upload
                      </h3>
                      <button
                        onClick={() => console.log('Generate demo files not available')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center space-x-2"
                      >
                        <Images className="h-4 w-4" />
                        <span>Load Demo Files</span>
                      </button>
                    </div>
                    <MediaUploadArea className="max-w-2xl" />
                  </div>
                </div>
              )}
              
              {/* File/Folder Views */}
              {viewMode === 'grid' ? (
                <MediaGridView 
                  onPreview={(file) => {
                    setPreviewFile(file);
                    setShowPreviewModal(true);
                  }}
                  onEditFile={(file) => {
                    console.log('Edit file:', file);
                    // Add file edit modal here if needed
                  }}
                  onEditFolder={(folder) => {
                    setEditingFolder(folder);
                    setShowFolderModal(true);
                  }}
                />
              ) : (
                <MediaListView 
                  onPreview={(file) => {
                    setPreviewFile(file);
                    setShowPreviewModal(true);
                  }}
                  onEditFile={(file) => {
                    console.log('Edit file:', file);
                    // Add file edit modal here if needed
                  }}
                  onEditFolder={(folder) => {
                    setEditingFolder(folder);
                    setShowFolderModal(true);
                  }}
                />
              )}
            </div>
          </div>
        );

      case 'documentation':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden h-[80vh]">
            <DocumentationView
              onCreateDocument={() => {
                // Handle document creation
              }}
            />
          </div>
        );

      case 'components':
        const filteredComponents = getFilteredComponents();
        const uniqueCategories = [...new Set(components.map(c => c.category))];
        const uniqueTypes = [...new Set(components.map(c => c.type))];

        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Component Library</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  สร้างและจัดการ UI components สำหรับพัฒนา lowcode platform
                </p>
              </div>
              <button
                onClick={handleCreateComponent}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Component
              </button>
            </div>

            {/* Stats Cards */}
            {componentStats && (
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Component className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Components</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{componentStats.total}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Published</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{componentStats.published}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Edit className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Drafts</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{componentStats.draft}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center">
                      <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Public</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{componentStats.publicComponents}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search components..."
                      value={componentSearchTerm}
                      onChange={(e) => setComponentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={componentCategoryFilter}
                    onChange={(e) => setComponentCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={componentTypeFilter}
                    onChange={(e) => setComponentTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    {uniqueTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Components List */}
            <div className="p-4 sm:p-6">
              {componentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Loading components...</span>
                </div>
              ) : filteredComponents.length === 0 ? (
                <div className="text-center py-12">
                  <Component className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    {componentSearchTerm || componentCategoryFilter !== 'all' || componentTypeFilter !== 'all'
                      ? 'No Components Found'
                      : 'No Components Yet'
                    }
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {componentSearchTerm || componentCategoryFilter !== 'all' || componentTypeFilter !== 'all'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Create your first component to get started building your library.'
                    }
                  </p>
                  {!componentSearchTerm && componentCategoryFilter === 'all' && componentTypeFilter === 'all' && (
                    <button
                      onClick={handleCreateComponent}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Component
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredComponents.map(component => (
                    <div key={component.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                            {component.name}
                          </h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {component.type}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                              {component.category}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                              component.status === 'published' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {component.status}
                            </span>
                          </div>
                          {component.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                              {component.description}
                            </p>
                          )}
                          {component.tags && component.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {component.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                  {tag}
                                </span>
                              ))}
                              {component.tags.length > 3 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                                  +{component.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <span>v{component.version}</span>
                            {component.isPublic && (
                              <>
                                <span className="mx-1">•</span>
                                <Globe className="h-3 w-3 mr-1" />
                                <span>Public</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Updated {new Date(component.updatedAt!).toLocaleDateString()}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleShowComponentHistory(component)}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View History"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditComponent(component)}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteComponent(component.id!)}
                            className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'project-management':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Task Management</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Manage tasks with Kanban board, timeline and table views
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => generateDemoProjects()}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Load Demo Project
                </button>
                <button 
                  onClick={() => {
                    setSelectedTask(null);
                    setIsCreatingTask(true);
                    setShowTaskModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </button>
              </div>
            </div>

            {/* View Toggle */}
            <div className="px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  onClick={() => setProjectManagementView('timeline')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    projectManagementView === 'timeline'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2 inline" />
                  Timeline
                </button>
                <button
                  onClick={() => setProjectManagementView('kanban')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    projectManagementView === 'kanban'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Layers className="h-4 w-4 mr-2 inline" />
                  Kanban
                </button>
                <button
                  onClick={() => setProjectManagementView('table')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    projectManagementView === 'table'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Table className="h-4 w-4 mr-2 inline" />
                  Table
                </button>
                <button
                  onClick={() => setProjectManagementView('summary')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    projectManagementView === 'summary'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2 inline" />
                  Summary
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[70vh]">
              {!currentProject ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Project Selected
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Create or load a demo project to get started with project management
                    </p>
                    <button 
                      onClick={() => generateDemoProjects()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Load Demo Project
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {projectManagementView === 'timeline' && (
                    <TimelineView
                      onTaskClick={(task) => {
                        setSelectedTask(task);
                        setIsCreatingTask(false);
                        setShowTaskModal(true);
                      }}
                      onCreateTask={() => {
                        setSelectedTask(null);
                        setIsCreatingTask(true);
                        setShowTaskModal(true);
                      }}
                    />
                  )}
                  {projectManagementView === 'kanban' && (
                    <KanbanView
                      onTaskClick={(task) => {
                        setSelectedTask(task);
                        setIsCreatingTask(false);
                        setShowTaskModal(true);
                      }}
                      onCreateTask={() => {
                        setSelectedTask(null);
                        setIsCreatingTask(true);
                        setShowTaskModal(true);
                      }}
                    />
                  )}
                  {projectManagementView === 'table' && (
                    <TableView
                      onTaskClick={(task) => {
                        setSelectedTask(task);
                        setIsCreatingTask(false);
                        setShowTaskModal(true);
                      }}
                      onCreateTask={() => {
                        setSelectedTask(null);
                        setIsCreatingTask(true);
                        setShowTaskModal(true);
                      }}
                    />
                  )}
                  {projectManagementView === 'summary' && (
                    <div className="p-6 overflow-y-auto h-full">
                      <TaskSummary />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'secret-management':
        const expiredSecrets = getExpiredSecrets();
        const expiringSoonSecrets = getExpiringSoonSecrets();
        
        const filteredSecrets = secrets.filter(secret => {
          const matchesSearch = secret.name.toLowerCase().includes(secretSearchQuery.toLowerCase()) ||
            secret.description.toLowerCase().includes(secretSearchQuery.toLowerCase()) ||
            secret.tags.some(tag => tag.toLowerCase().includes(secretSearchQuery.toLowerCase()));
          
          const matchesType = secretTypeFilter === 'all' || secret.type === secretTypeFilter;
          
          return matchesSearch && matchesType;
        });

        const copyToClipboard = (text: string) => {
          navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log('Copied to clipboard');
          });
        };

        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Secret Key Management</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Securely manage API keys, passwords, certificates, and tokens
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => generateDemoSecrets()}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Load Demo Secrets
                </button>
                <button 
                  onClick={() => {
                    setEditingSecret(null);
                    setShowSecretModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Secret
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {secrets.length > 0 && (
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{secrets.length}</div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">Total Secrets</div>
                      </div>
                      <Key className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {secrets.filter(s => s.type === 'api_key').length}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">API Keys</div>
                      </div>
                      <Key className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {expiringSoonSecrets.length}
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400">Expiring Soon</div>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {expiredSecrets.length}
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">Expired</div>
                      </div>
                      <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search secrets by name, description, or tags..."
                    value={secretSearchQuery}
                    onChange={(e) => setSecretSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <select
                    value={secretTypeFilter}
                    onChange={(e) => setSecretTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="api_key">API Keys</option>
                    <option value="password">Passwords</option>
                    <option value="certificate">Certificates</option>
                    <option value="token">Tokens</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              {secrets.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    No Secrets Found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Store and manage your API keys, passwords, and other sensitive data securely
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => generateDemoSecrets()}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      Try Demo Secrets
                    </button>
                    <button 
                      onClick={() => {
                        setEditingSecret(null);
                        setShowSecretModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Add Your First Secret
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredSecrets.map(secret => (
                    <SecretKeyCard
                      key={secret.id}
                      secret={secret}
                      onEdit={(secret) => {
                        setEditingSecret(secret);
                        setShowSecretModal(true);
                      }}
                      onDelete={(id) => {
                        if (confirm('Are you sure you want to delete this secret?')) {
                          deleteSecret(id);
                        }
                      }}
                      onCopy={copyToClipboard}
                    />
                  ))}
                </div>
              )}
              
              {filteredSecrets.length === 0 && secrets.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    No secrets match your current filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'user-groups':
        return <UserGroups />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
          <div className="w-full h-16 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <nav className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
          {/* Main Navigation */}
          <CollapsibleMenuGroup
            title="Main"
            icon={Home}
            defaultExpanded={true}
            items={[
              {
                key: 'dashboard',
                label: t('dashboard'),
                icon: Home,
                isActive: activeView === 'dashboard',
                onClick: () => setActiveView('dashboard')
              }
            ]}
          />
          {/* Development */}
          <CollapsibleMenuGroup
            title="Development"
            icon={Code2}
            defaultExpanded={true}
            items={[
              {
                key: 'projects',
                label: t('myProjects'),
                icon: Layers,
                isActive: activeView === 'projects',
                onClick: () => setActiveView('projects'),
                badge: projects.length > 0 ? projects.length : undefined
              },
              {
                key: 'pages',
                label: t('pages'),
                icon: Globe2,
                isActive: activeView === 'pages',
                onClick: () => setActiveView('pages')
              },
              {
                key: 'services',
                label: t('services'),
                icon: ServerIcon,
                isActive: activeView === 'services',
                onClick: () => setActiveView('services')
              },
              {
                key: 'components',
                label: t('components'),
                icon: Component,
                isActive: activeView === 'components',
                onClick: () => setActiveView('components')
              }
            ]}
          />
          <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
          {/* Data Management */}
          <CollapsibleMenuGroup
            title="Data Management"
            icon={FolderOpen}
            defaultExpanded={true}
            items={[
              {
                key: 'database',
                label: 'Database',
                icon: Database,
                isActive: activeView === 'database',
                onClick: () => setActiveView('database')
              },
              {
                key: 'media',
                label: 'Media',
                icon: Images,
                isActive: activeView === 'media',
                onClick: () => setActiveView('media')
              },
              {
                key: 'documentation',
                label: 'Documentation',
                icon: FileText,
                isActive: activeView === 'documentation',
                onClick: () => setActiveView('documentation')
              }
            ]}
          />
          {/* Project Tools */}
          <CollapsibleMenuGroup
            title="Project Tools"
            icon={Wrench}
            defaultExpanded={true}
            items={[
              {
                key: 'project-management',
                label: 'Task Management',
                icon: Calendar,
                isActive: activeView === 'project-management',
                onClick: () => setActiveView('project-management')
              },
              {
                key: 'secret-management',
                label: 'Secret Keys',
                icon: Key,
                isActive: activeView === 'secret-management',
                onClick: () => setActiveView('secret-management'),
                badge: secrets.length > 0 ? secrets.length : undefined
              }
            ]}
          />
          {/* Users */}
          <CollapsibleMenuGroup
            title="Users"
            icon={Users}
            defaultExpanded={false}
            items={[
              {
                key: 'user-groups',
                label: 'User Groups',
                icon: Users,
                isActive: activeView === 'user-groups',
                onClick: () => setActiveView('user-groups')
              }
            ]}
          />
          {/* Settings & Admin */}
          <CollapsibleMenuGroup
            title="Settings & Admin"
            icon={Cog}
            defaultExpanded={false}
            items={[
              {
                key: 'settings',
                label: t('settings'),
                icon: Settings,
                isActive: activeView === 'settings',
                onClick: () => setActiveView('settings')
              },
              ...(userRole === 'admin' ? [
                {
                  key: 'admin-panel',
                  label: t('adminPanel'),
                  icon: Shield,
                  isActive: false,
                  onClick: () => router.push('/admin')
                },
                {
                  key: 'users',
                  label: t('users'),
                  icon: Users,
                  isActive: activeView === 'users',
                  onClick: () => setActiveView('users')
                },
                {
                  key: 'analytics',
                  label: t('analytics'),
                  icon: Activity,
                  isActive: activeView === 'analytics',
                  onClick: () => setActiveView('analytics')
                }
              ] : [])
            ]}
          />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-white">User Name</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  {userTier} Plan
                </div>
              </div>
            </div>
            <button 
              onClick={() => { 
                logout(); 
                setIsAuthenticated(false); // Keep legacy support
                router.push('/landing'); 
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <button 
            onClick={() => setShowPlanUpgradeModal(true)}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition transform hover:scale-105"
          >
            {t('upgradePlan')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center justify-center flex-1 h-full px-2">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-full h-full object-contain max-w-[200px] max-h-[40px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>
            <CurrencySwitcher />
            <LanguageSwitcher />
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-8">
          {/* Header - Desktop only */}
          <div className="hidden lg:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('welcomeBack')}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{t('whatsHappening')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <button 
                onClick={openChatbot}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title="เปิด AI Assistant"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <CurrencySwitcher />
              <LanguageSwitcher />
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('welcomeBack')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('whatsHappeningMobile')}</p>
          </div>

          {/* Render content based on active view */}
          {activeView === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      12%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('totalProjects')}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      8%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.published}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('published')}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      24%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTasks}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('totalTasks')}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedTasks}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('completedTasks')}</div>
                </div>
              </div>

              {/* Notes Board */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Quick Notes</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Sticky notes from your team</p>
                </div>
                <div className="p-4 sm:p-6">
                  <NotesBoard />
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('recentProjects')}</h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('newProjectDemo')}
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {/* Mobile Cards View */}
                  <div className="lg:hidden space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                              {project.type}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            project.status === 'Published' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{t('progress')}:</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {project.completed}/{project.tasks}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                              style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">{project.lastModified}</span>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => { setSelectedProject(project); router.push('/builder'); }}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                          <th className="pb-4">{t('projectName')}</th>
                          <th className="pb-4">{t('type')}</th>
                          <th className="pb-4">{t('status')}</th>
                          <th className="pb-4">{t('progress')}</th>
                          <th className="pb-4">{t('lastModified')}</th>
                          <th className="pb-4">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {projects.map(project => (
                          <tr key={project.id} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="py-4">
                              <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                                {project.type}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded text-sm ${
                                project.status === 'Published' 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                    style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {project.completed}/{project.tasks}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                              {project.lastModified}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => { setSelectedProject(project); router.push('/builder'); }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                >
                                  <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Render other menu content */}
          {renderContent()}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" placeholder="My Awesome App" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" rows={3} placeholder="Describe your project..."></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'Full-Stack', label: t('fullStack'), desc: t('fullStackDesc') },
                    { key: 'Single Web', label: t('singleWeb'), desc: t('singleWebDesc') },
                    { key: 'Microservice', label: t('microservice'), desc: t('microserviceDesc') },
                    { key: 'Script Logic', label: t('scriptLogic'), desc: t('scriptLogicDesc') }
                  ].map(type => (
                    <button key={type.key} className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition text-left">
                      <div className="font-medium text-slate-900 dark:text-white">{type.label}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {type.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Platform</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Web
                  </button>
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Mobile
                  </button>
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    IoT
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => { setShowCreateModal(false); router.push('/builder'); }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Map Modal */}
      {showSiteMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <SiteMap 
              userRole={userRole}
              isAuthenticated={true}
              onClose={() => setShowSiteMap(false)}
            />
          </div>
        </div>
      )}

      {/* WeUI Modal */}
      <WeUIModal
        isOpen={showWeUIModal}
        onClose={() => setShowWeUIModal(false)}
      />

      {/* Service Flow Modal */}
      <ServiceFlowModal
        isOpen={showServiceFlowModal}
        onClose={() => {
          setShowServiceFlowModal(false);
          setEditingFlow(null);
          if (activeView === 'services') {
            loadServices(); // Refresh services after modal closes
          }
        }}
        editingFlow={editingFlow}
      />

      {/* Database Connection Modal */}
      <DatabaseConnectionModal
        isOpen={showConnectionModal}
        onClose={() => {
          setShowConnectionModal(false);
          setEditingConnection(null);
        }}
        onSave={async (connectionData) => {
          if (editingConnection) {
            await updateConnection(editingConnection.id, connectionData);
          } else {
            await addConnection(connectionData);
          }
          setShowConnectionModal(false);
          setEditingConnection(null);
        }}
        editingConnection={editingConnection}
        isLoading={dbLoading}
      />

      {/* Media Modals */}
      <FolderModal
        isOpen={showFolderModal}
        onClose={() => {
          setShowFolderModal(false);
          setEditingFolder(null);
        }}
        folder={editingFolder}
      />

      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewFile(null);
        }}
        file={previewFile}
        onEdit={(file) => {
          console.log('Edit file:', file);
          setShowPreviewModal(false);
          // Add file edit modal here if needed
        }}
        onDelete={async () => {
          // Handle file deletion
          setShowPreviewModal(false);
          setPreviewFile(null);
        }}
      />

      {/* Project Management Modals */}
      <TaskDetailModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
          setIsCreatingTask(false);
        }}
        task={selectedTask}
        isCreating={isCreatingTask}
      />

      {/* Secret Management Modal */}
      <SecretKeyModal
        isOpen={showSecretModal}
        onClose={() => {
          setShowSecretModal(false);
          setEditingSecret(null);
        }}
        onSave={async (secretData) => {
          if (editingSecret) {
            await updateSecret(editingSecret.id, secretData);
          } else {
            await addSecret(secretData);
          }
        }}
        editingSecret={editingSecret}
      />

      {/* Component Management Modals */}
      <ComponentBuilderModal
        isOpen={showComponentModal}
        onClose={() => {
          setShowComponentModal(false);
          setEditingComponent(null);
        }}
        onSave={handleSaveComponent}
        editingComponent={editingComponent}
        userId={user?.id || 1}
      />

      <ComponentHistoryPanel
        isOpen={showComponentHistory}
        onClose={() => {
          setShowComponentHistory(false);
          setSelectedComponentForHistory(null);
        }}
        componentId={selectedComponentForHistory?.id || 0}
        componentName={selectedComponentForHistory?.name || ''}
        onRestore={() => {
          loadComponents();
        }}
        userId={user?.id || 1}
      />

      {/* Page Management Modals */}
      <PageModal
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false);
          setEditingPage(null);
        }}
        onSave={handleSavePage}
        editingPage={editingPage}
        userId={user?.id || 1}
      />

      <PageHistoryPanel
        isOpen={showPageHistory}
        onClose={() => {
          setShowPageHistory(false);
          setSelectedPageForHistory(null);
        }}
        pageId={selectedPageForHistory?.id || 0}
        pageTitle={selectedPageForHistory?.title || ''}
        onRestore={() => {
          loadPages();
        }}
        userId={user?.id || 1}
      />

      {/* My Project Modal */}
      <MyProjectModal
        isOpen={showMyProjectModal}
        onClose={() => setShowMyProjectModal(false)}
        onProjectCreated={(project) => {
          console.log('Project created:', project);
          setMyProjects(prev => [...prev, project]);
          // Route to reactflow page with the new project
          router.push(`/reactflow?projectId=${project.id}`);
        }}
      />

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showPlanUpgradeModal}
        onClose={() => setShowPlanUpgradeModal(false)}
        currentTier={userTier}
      />
    </div>
  );
};

export default Dashboard;