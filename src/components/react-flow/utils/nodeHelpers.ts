import { Database, Cpu, Box, Zap, Layers, Square, Globe, User, Settings } from 'lucide-react';
import { NodeCategory } from '../types';

// Shape types for different node categories
export type NodeShapeType = 'rectangle' | 'user' | 'process' | 'decision' | 'data' | 'terminal' | 'document' | 'service' | 'api' | 'page';

// Node shape configuration
export const getNodeShape = (type: string): NodeShapeType => {
  const shapes: { [key: string]: NodeShapeType } = {
    'User': 'user',
    'Page': 'page',
    'Service': 'service',
    'API Call': 'api',
    'Database': 'data',
    'Logic': 'decision',
    'Condition': 'decision',
    'Transform': 'process',
    'Function': 'process',
    'Display': 'document',
    'Export': 'document',
    'Button': 'rectangle',
    'Form': 'rectangle',
    'Chart': 'rectangle',
    'Table': 'rectangle'
  };
  return shapes[type] || 'rectangle';
};

export const getNodeDescription = (type: string): string => {
  const descriptions: { [key: string]: string } = {
    'API Call': 'HTTP Request',
    'Database': 'Data Storage',
    'UI Component': 'Interface Element',
    'Logic': 'Business Logic',
    'Condition': 'If/Else Logic',
    'Loop': 'Iteration',
    'Transform': 'Data Transform',
    'Group': 'Flow Grouping',
    'Frame': 'Visual Frame',
    'Section': 'Flow Section',
    'Service': 'Background Service',
    'Page': 'Web Page',
    'User': 'User Input'
  };
  return descriptions[type] || 'Custom Node';
};

export const getNodeIcon = (type: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    'API Call': Database,
    'Database': Database,
    'UI Component': Box,
    'Logic': Zap,
    'Condition': Zap,
    'Loop': Zap,
    'Transform': Cpu,
    'Group': Layers,
    'Frame': Square,
    'Section': Square,
    'Service': Settings,
    'Page': Globe,
    'User': User
  };
  return icons[type] || Box;
};

export const getGroupBackgroundColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'Group': 'rgba(59, 130, 246, 0.1)', // Blue
    'Frame': 'rgba(16, 185, 129, 0.1)', // Green  
    'Section': 'rgba(245, 158, 11, 0.1)' // Yellow
  };
  return colors[type] || 'rgba(248, 250, 252, 0.8)';
};

export const nodeCategories: NodeCategory[] = [
  {
    title: 'Organization',
    items: ['Group', 'Frame', 'Section']
  },
  {
    title: 'Application',
    items: ['User', 'Page', 'Service']
  },
  {
    title: 'Data Sources',
    items: ['API Call', 'Database', 'File Input']
  },
  {
    title: 'UI Components',
    items: ['Button', 'Form', 'Chart', 'Table']
  },
  {
    title: 'Logic',
    items: ['Condition', 'Loop', 'Transform', 'Function']
  },
  {
    title: 'Outputs',
    items: ['Display', 'Export', 'Notification']
  }
];

// Helper function to calculate distance from point to line
export const distancePointToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
};