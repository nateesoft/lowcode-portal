// Export API client
export { default as apiClient } from './client';

// Export all API modules
export * from './auth';
export * from './users';
export * from './projects';
export * from './components';
export * from './pages';
export * from './services';
export * from './flows';
export * from './media';
export * from './notes';

// Export all types
export * from '../types';

// Legacy exports for backward compatibility
export { apiClient as api };

// Convenience object for accessing all APIs
export const APIs = {
  auth: require('./auth').authAPI,
  users: require('./users').usersAPI,
  userGroups: require('./users').userGroupAPI,
  userTypes: require('./users').userTypeAPI,
  projects: require('./projects').myProjectAPI,
  components: require('./components').componentAPI,
  pages: require('./pages').pageAPI,
  services: require('./services').serviceAPI,
  secretKeys: require('./services').secretKeyAPI,
  flows: require('./flows').flowAPI,
  flowVersions: require('./flows').flowVersionAPI,
  nodeContents: require('./flows').nodeContentAPI,
  media: require('./media').mediaAPI,
  notes: require('./notes').notesAPI,
};