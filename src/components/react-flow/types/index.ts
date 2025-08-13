import { Node, Edge } from 'reactflow';

// Node Data Interface
export interface NodeData {
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: string;
  shadow?: string;
  width?: number | string;
  height?: number | string;
  opacity?: number | string;
  isGroup?: boolean;
  componentType?: string;
  textContent?: string;
  url?: string;
  method?: string;
  hoverScale?: string;
  hoverShadow?: string;
  transitionDuration?: string;
  [key: string]: unknown;
}

// Website Template Interface
export interface WebsiteTemplate {
  name: string;
  description: string;
  preview: string;
  primaryColor: string;
  backgroundColor: string;
  headerStyle: 'gradient' | 'solid' | 'artistic' | 'minimal' | 'dark';
  fontFamily: string;
}

// Website Structure Interface
export interface WebsiteStructure {
  [nodeId: string]: {
    node: Node;
    connections: string[];
  };
}

// Node Category Interface
export interface NodeCategory {
  title: string;
  items: string[];
}

// Flow Execution Interfaces
export interface ExecutionResult {
  type: string;
  status: string;
  data: any;
  executionTime: number;
}

export interface ExecutionStep {
  nodeId: string;
  nodeName: string;
  result: ExecutionResult;
  timestamp: string;
}

// Component Props Interfaces
export interface ReactFlowPageProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export interface NodeSelectorState {
  show: boolean;
  edgeId: string;
  position: { x: number; y: number };
}

// Template Selector State
export interface TemplateSelectorState {
  showTemplateSelector: boolean;
  selectedTemplate: string;
}