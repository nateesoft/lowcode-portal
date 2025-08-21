export { default as DashboardOverview } from './DashboardOverview';
export { default as ProjectsView } from './ProjectsView';
export { default as ServicesView } from './ServicesView';

// Export existing views from other components
export { 
  DatabaseConnectionCard, 
  DatabaseConnectionModal, 
  DatabaseTablesView,
  DatabaseQueryView
} from '@/components/database';

export { DocumentationView } from '@/components/documentation';

export { 
  TimelineView,
  TableView,
  KanbanView, 
  TaskDetailModal, 
  TaskSummary 
} from '@/components/project-management';

export { default as UserGroups } from '@/components/pages/UserGroups';