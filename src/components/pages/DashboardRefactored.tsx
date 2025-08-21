import React, { useState, useEffect } from 'react';
import { Project, UserRole, UserTier } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import { 
  DashboardLayout, 
  DashboardOverview, 
  ProjectsView, 
  ServicesView 
} from '@/components/dashboard';
import { DocumentationView } from '@/components/documentation';
import { 
  TimelineView,
  TableView,
  KanbanView, 
  TaskDetailModal, 
  TaskSummary 
} from '@/components/project-management';
import UserGroups from '@/components/pages/UserGroups';
import WeUIModal from '@/components/modals/WeUIModal';
import ServiceFlowModal from '@/components/modals/ServiceFlowModal';
import ComponentBuilderModal from '@/components/modals/ComponentBuilderModal';
import ComponentHistoryPanel from '@/components/panels/ComponentHistoryPanel';
import PageModal from '@/components/modals/PageModal';
import PageHistoryPanel from '@/components/panels/PageHistoryPanel';
import MyProjectModal from '@/components/modals/MyProjectModal';
import { useChatbot } from '@/contexts/ChatbotContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useMedia } from '@/contexts/MediaContext';
import { useProjectManagement } from '@/contexts/ProjectManagementContext';
import { useSecretManagement } from '@/contexts/SecretManagementContext';
import { 
  serviceAPI, 
  ServiceResponse, 
  componentAPI, 
  ComponentData, 
  ComponentStats, 
  CreateComponentRequest, 
  pageAPI, 
  PageData, 
  PageStats, 
  CreatePageRequest, 
  myProjectAPI, 
  MyProjectData 
} from '@/lib/api';
import { useAlertActions } from '@/hooks/useAlert';
import { useAlert } from '@/contexts/AlertContext';

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

const DashboardRefactored: React.FC<DashboardProps> = ({
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
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  
  // Services state
  const [flows, setFlows] = useState<ServiceResponse[]>([]);
  const [editingFlow, setEditingFlow] = useState<ServiceResponse | null>(null);
  const [showServiceFlowModal, setShowServiceFlowModal] = useState(false);
  
  // Components state
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [componentStats, setComponentStats] = useState<ComponentStats | null>(null);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<ComponentData | null>(null);
  const [selectedComponentForHistory, setSelectedComponentForHistory] = useState<ComponentData | null>(null);
  
  // Pages state
  const [pages, setPages] = useState<PageData[]>([]);
  const [pageStats, setPageStats] = useState<PageStats | null>(null);
  const [showPageModal, setShowPageModal] = useState(false);
  const [editingPage, setEditingPage] = useState<PageData | null>(null);
  const [selectedPageForHistory, setSelectedPageForHistory] = useState<PageData | null>(null);
  
  // Projects state
  const [myProjects, setMyProjects] = useState<MyProjectData[]>([]);
  const [showMyProjectModal, setShowMyProjectModal] = useState(false);
  
  // Project Management state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [projectManagementView, setProjectManagementView] = useState<'timeline' | 'table' | 'kanban' | 'summary'>('timeline');
  
  // Contexts
  const { openChatbot } = useChatbot();
  const { alert } = useAlertActions();
  const { showConfirm } = useAlert();
  const { 
    connections, 
    isLoading: isDatabaseLoading,
    selectedConnection,
    setSelectedConnection,
    loadConnections 
  } = useDatabase();
  const { 
    currentPath, 
    files, 
    selectedFiles, 
    viewMode,
    isLoading: isMediaLoading,
    navigateToPath, 
    setViewMode, 
    loadMediaFiles 
  } = useMedia();
  const { 
    tasks, 
    projects: pmProjects,
    isLoading: isPMLoading,
    loadTasks 
  } = useProjectManagement();
  const { secrets } = useSecretManagement();

  // Load functions
  const loadServices = async () => {
    if (activeView === 'services') {
      try {
        const response = await serviceAPI.getAll();
        setFlows(response.data);
      } catch (error) {
        console.error('Failed to load services:', error);
      }
    }
  };

  const loadComponents = async () => {
    if (activeView === 'components') {
      try {
        const [componentsResponse, statsResponse] = await Promise.all([
          componentAPI.getAll(),
          componentAPI.getStats()
        ]);
        setComponents(componentsResponse.data);
        setComponentStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to load components:', error);
      }
    }
  };

  const loadPages = async () => {
    if (activeView === 'pages') {
      try {
        const [pagesResponse, statsResponse] = await Promise.all([
          pageAPI.getAll(),
          pageAPI.getStats()
        ]);
        setPages(pagesResponse.data);
        setPageStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to load pages:', error);
      }
    }
  };

  const loadMyProjects = async () => {
    if (activeView === 'projects') {
      try {
        const response = await myProjectAPI.getAll();
        setMyProjects(response.data);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (await showConfirm('Are you sure you want to delete this project?', 'This action cannot be undone.', {
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmType: 'danger'
    })) {
      try {
        await myProjectAPI.delete(projectId);
        alert.apiSuccess('delete');
        loadMyProjects();
      } catch (error: any) {
        console.error('Delete project error:', error);
        alert.apiError('delete', error.response?.data?.message || error.message);
      }
    }
  };

  // Component handlers
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
        await componentAPI.update(editingComponent.id, componentData);
        alert.apiSuccess('update');
      } else {
        await componentAPI.create(componentData);
        alert.apiSuccess('create');
      }
      setShowComponentModal(false);
      setEditingComponent(null);
      loadComponents();
    } catch (error: any) {
      console.error('Save component error:', error);
      alert.apiError(editingComponent ? 'update' : 'create', error.response?.data?.message || error.message);
    }
  };

  // Page handlers
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
        await pageAPI.update(editingPage.id, pageData);
        alert.apiSuccess('update');
      } else {
        await pageAPI.create(pageData);
        alert.apiSuccess('create');
      }
      setShowPageModal(false);
      setEditingPage(null);
      loadPages();
    } catch (error: any) {
      console.error('Save page error:', error);
      alert.apiError(editingPage ? 'update' : 'create', error.response?.data?.message || error.message);
    }
  };

  // Effect to load data when view changes
  useEffect(() => {
    switch (activeView) {
      case 'services':
        loadServices();
        break;
      case 'components':
        loadComponents();
        break;
      case 'pages':
        loadPages();
        break;
      case 'projects':
        loadMyProjects();
        break;
      case 'database':
        loadConnections();
        break;
      case 'media':
        loadMediaFiles();
        break;
      case 'project-management':
        loadTasks();
        break;
    }
  }, [activeView]);

  // Calculate stats for dashboard
  const stats = {
    totalProjects: projects.length,
    published: projects.filter(p => p.status === 'Published').length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length
  };

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardOverview
            projects={projects}
            stats={stats}
            setShowCreateModal={setShowCreateModal}
            setSelectedProject={setSelectedProject}
          />
        );

      case 'projects':
        return (
          <ProjectsView
            myProjects={myProjects}
            setShowMyProjectModal={setShowMyProjectModal}
            handleDeleteProject={handleDeleteProject}
          />
        );

      case 'services':
        return (
          <ServicesView
            flows={flows}
            setShowServiceFlowModal={setShowServiceFlowModal}
            setEditingFlow={setEditingFlow}
            loadServices={loadServices}
          />
        );

      case 'components':
        // This would be implemented similar to other views
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Components View</h2>
            <p className="text-slate-600 dark:text-slate-400">Components management interface would be implemented here.</p>
          </div>
        );

      case 'pages':
        // This would be implemented similar to other views  
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Pages View</h2>
            <p className="text-slate-600 dark:text-slate-400">Pages management interface would be implemented here.</p>
          </div>
        );

      case 'database':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Database Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Database interface would be integrated here.</p>
          </div>
        );

      case 'media':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Media Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Media interface would be integrated here.</p>
          </div>
        );

      case 'documentation':
        return <DocumentationView />;

      case 'project-management':
        return (
          <div className="space-y-6">
            <TaskSummary />
            {projectManagementView === 'timeline' && <TimelineView />}
            {projectManagementView === 'table' && <TableView />}
            {projectManagementView === 'kanban' && <KanbanView />}
          </div>
        );

      case 'secret-management':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Secret Management</h2>
            <p className="text-slate-600 dark:text-slate-400">Secret management interface would be implemented here.</p>
          </div>
        );

      case 'user-groups':
        return <UserGroups />;

      case 'settings':
      case 'users':
      case 'analytics':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{activeView.charAt(0).toUpperCase() + activeView.slice(1)} View</h2>
            <p className="text-slate-600 dark:text-slate-400">This view would be implemented here.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      darkMode={darkMode}
      mobileSidebarOpen={mobileSidebarOpen}
      activeView={activeView}
      userRole={userRole}
      userTier={userTier}
      projects={projects}
      setDarkMode={setDarkMode}
      setMobileSidebarOpen={setMobileSidebarOpen}
      setActiveView={setActiveView}
      setIsAuthenticated={setIsAuthenticated}
    >
      {renderContent()}

      {/* Modals */}
      <WeUIModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSelect={setSelectedProject}
      />

      <ServiceFlowModal
        isOpen={showServiceFlowModal}
        onClose={() => {
          setShowServiceFlowModal(false);
          setEditingFlow(null);
        }}
        editingFlow={editingFlow}
        onSave={loadServices}
      />

      <ComponentBuilderModal
        isOpen={showComponentModal}
        onClose={() => {
          setShowComponentModal(false);
          setEditingComponent(null);
        }}
        editingComponent={editingComponent}
        onSave={handleSaveComponent}
      />

      <ComponentHistoryPanel
        component={selectedComponentForHistory}
        isOpen={!!selectedComponentForHistory}
        onClose={() => setSelectedComponentForHistory(null)}
      />

      <PageModal
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false);
          setEditingPage(null);
        }}
        editingPage={editingPage}
        onSave={handleSavePage}
      />

      <PageHistoryPanel
        page={selectedPageForHistory}
        isOpen={!!selectedPageForHistory}
        onClose={() => setSelectedPageForHistory(null)}
      />

      <MyProjectModal
        isOpen={showMyProjectModal}
        onClose={() => setShowMyProjectModal(false)}
        onSave={loadMyProjects}
      />

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={loadTasks}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardRefactored;