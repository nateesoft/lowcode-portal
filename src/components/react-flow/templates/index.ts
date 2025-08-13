import { WebsiteTemplate } from '../types';

export const websiteTemplates: { [key: string]: WebsiteTemplate } = {
  modern: {
    name: 'Modern',
    description: 'Clean and modern design with gradients',
    preview: '🎨',
    primaryColor: '#6366f1',
    backgroundColor: '#f8fafc',
    headerStyle: 'gradient',
    fontFamily: 'Inter, sans-serif'
  },
  classic: {
    name: 'Classic',
    description: 'Traditional corporate design',
    preview: '🏢',
    primaryColor: '#1f2937',
    backgroundColor: '#ffffff',
    headerStyle: 'solid',
    fontFamily: 'Georgia, serif'
  },
  creative: {
    name: 'Creative',
    description: 'Colorful and playful design',
    preview: '🌈',
    primaryColor: '#ec4899',
    backgroundColor: '#fef7ff',
    headerStyle: 'artistic',
    fontFamily: 'Poppins, sans-serif'
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and clean layout',
    preview: '⭕',
    primaryColor: '#64748b',
    backgroundColor: '#fafafa',
    headerStyle: 'minimal',
    fontFamily: 'system-ui, sans-serif'
  },
  dark: {
    name: 'Dark Mode',
    description: 'Dark theme with neon accents',
    preview: '🌙',
    primaryColor: '#00d9ff',
    backgroundColor: '#0f172a',
    headerStyle: 'dark',
    fontFamily: 'JetBrains Mono, monospace'
  }
};