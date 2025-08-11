import { Project, Template, TierLimit } from './types';

export const SAMPLE_PROJECTS: Project[] = [
  { id: 1, name: 'E-commerce Platform', type: 'Full-Stack', status: 'Published', lastModified: '2025-01-10', tasks: 12, completed: 8 },
  { id: 2, name: 'Dashboard Analytics', type: 'Single Web', status: 'Draft', lastModified: '2025-01-09', tasks: 5, completed: 2 },
  { id: 3, name: 'Payment Service', type: 'Microservice', status: 'Draft', lastModified: '2025-01-08', tasks: 8, completed: 8 },
];

export const TEMPLATES: Template[] = [
  { id: 1, name: 'E-commerce Starter', category: 'Full-Stack', description: 'Complete online store with cart, checkout, and admin panel', stars: 4.8, uses: 1250, icon: '🛍️' },
  { id: 2, name: 'Admin Dashboard', category: 'Single Web', description: 'Modern analytics dashboard with charts and widgets', stars: 4.7, uses: 890, icon: '📊' },
  { id: 3, name: 'API Gateway', category: 'Microservice', description: 'Scalable API gateway with authentication and rate limiting', stars: 4.9, uses: 567, icon: '🔌' },
  { id: 4, name: 'Blog Platform', category: 'Full-Stack', description: 'Content management system with editor and comments', stars: 4.6, uses: 2100, icon: '📝' },
  { id: 5, name: 'Data Pipeline', category: 'Script Logic', description: 'ETL pipeline for data processing and transformation', stars: 4.5, uses: 345, icon: '⚡' },
  { id: 6, name: 'Real-time Chat', category: 'Full-Stack', description: 'WebSocket-based chat application with rooms', stars: 4.8, uses: 780, icon: '💬' },
];

export const TIER_LIMITS: Record<string, TierLimit> = {
  Junior: { projects: 1, exports: 3, nodes: 20, support: 'Community' },
  Senior: { projects: 5, exports: 20, nodes: 100, support: 'Email' },
  Specialist: { projects: '∞', exports: '∞', nodes: '∞', support: 'Priority' },
};

export const PROJECT_TYPES = ['Full-Stack', 'Single Web', 'Microservice', 'Script Logic'];

export const ADMIN_MOCK_STATS = {
  totalUsers: 1234,
  totalProjects: 5678,
  totalExports: 890,
  activeUsers: 456,
  juniorUsers: 800,
  seniorUsers: 350,
  specialistUsers: 84,
};