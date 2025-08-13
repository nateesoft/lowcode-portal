import React from 'react';

// Flowchart Shape Components as SVG
export interface FlowchartShapeProps {
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  label?: string;
  width?: number;
  height?: number;
}

// User/Person Shape (Human figure)
export const UserShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#3b82f6', 
  stroke = '#1e40af',
  strokeWidth = 2,
  label = '',
  width = 80,
  height = 80
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 80 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head circle */}
    <circle 
      cx="40" 
      cy="20" 
      r="12" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {/* Body */}
    <path 
      d="M40 32 L40 55 M25 42 L55 42 M40 55 L30 70 M40 55 L50 70" 
      stroke={stroke} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
    {/* Label */}
    {label && (
      <text 
        x="40" 
        y="75" 
        textAnchor="middle" 
        fontSize="10" 
        fill={stroke}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    )}
  </svg>
);

// Process/Task Rectangle (rounded rectangle)
export const ProcessShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#10b981', 
  stroke = '#059669',
  strokeWidth = 2,
  label = '',
  width = 100,
  height = 60
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 100 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect 
      x={strokeWidth/2} 
      y={strokeWidth/2} 
      width={100-strokeWidth} 
      height={60-strokeWidth} 
      rx="8" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {label && (
      <text 
        x="50" 
        y="35" 
        textAnchor="middle" 
        fontSize="12" 
        fill="white"
        fontFamily="system-ui, sans-serif"
        fontWeight="500"
      >
        {label}
      </text>
    )}
  </svg>
);

// Decision Diamond
export const DecisionShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#f59e0b', 
  stroke = '#d97706',
  strokeWidth = 2,
  label = '',
  width = 80,
  height = 80
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 80 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M40 5 L75 40 L40 75 L5 40 Z" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {label && (
      <text 
        x="40" 
        y="45" 
        textAnchor="middle" 
        fontSize="10" 
        fill="white"
        fontFamily="system-ui, sans-serif"
        fontWeight="500"
      >
        {label}
      </text>
    )}
  </svg>
);

// Data/Storage Cylinder
export const DataShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#8b5cf6', 
  stroke = '#7c3aed',
  strokeWidth = 2,
  label = '',
  width = 80,
  height = 80
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 80 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top ellipse */}
    <ellipse 
      cx="40" 
      cy="15" 
      rx="25" 
      ry="8" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {/* Cylinder body */}
    <rect 
      x="15" 
      y="15" 
      width="50" 
      height="50" 
      fill={fill} 
      stroke="none"
    />
    {/* Left and right sides */}
    <line 
      x1="15" 
      y1="15" 
      x2="15" 
      y2="65" 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    <line 
      x1="65" 
      y1="15" 
      x2="65" 
      y2="65" 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {/* Bottom ellipse */}
    <ellipse 
      cx="40" 
      cy="65" 
      rx="25" 
      ry="8" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {label && (
      <text 
        x="40" 
        y="75" 
        textAnchor="middle" 
        fontSize="10" 
        fill={stroke}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    )}
  </svg>
);

// Start/End Terminal (rounded rectangle)
export const TerminalShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#ef4444', 
  stroke = '#dc2626',
  strokeWidth = 2,
  label = '',
  width = 100,
  height = 50
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 100 50" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect 
      x={strokeWidth/2} 
      y={strokeWidth/2} 
      width={100-strokeWidth} 
      height={50-strokeWidth} 
      rx="25" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {label && (
      <text 
        x="50" 
        y="30" 
        textAnchor="middle" 
        fontSize="12" 
        fill="white"
        fontFamily="system-ui, sans-serif"
        fontWeight="500"
      >
        {label}
      </text>
    )}
  </svg>
);

// Document Shape
export const DocumentShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#06b6d4', 
  stroke = '#0891b2',
  strokeWidth = 2,
  label = '',
  width = 80,
  height = 80
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 80 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M10 10 L10 70 Q15 75 20 70 Q25 65 30 70 Q35 75 40 70 Q45 65 50 70 Q55 75 60 70 Q65 65 70 70 L70 10 Z" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {label && (
      <text 
        x="40" 
        y="75" 
        textAnchor="middle" 
        fontSize="10" 
        fill={stroke}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    )}
  </svg>
);

// Service Cloud Shape
export const ServiceShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#64748b', 
  stroke = '#475569',
  strokeWidth = 2,
  label = '',
  width = 100,
  height = 60
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 100 60" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M25 35 Q15 30 15 20 Q15 10 25 10 Q35 5 45 10 Q55 5 65 10 Q75 10 85 15 Q90 20 85 25 Q90 30 85 35 Q85 45 75 45 L25 45 Q15 45 15 35 Q15 30 25 35 Z" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {label && (
      <text 
        x="50" 
        y="55" 
        textAnchor="middle" 
        fontSize="10" 
        fill={stroke}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    )}
  </svg>
);

// API Hexagon Shape
export const ApiShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#ec4899', 
  stroke = '#db2777',
  strokeWidth = 2,
  label = '',
  width = 80,
  height = 80
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 80 80" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M20 40 L30 20 L50 20 L60 40 L50 60 L30 60 Z" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {label && (
      <text 
        x="40" 
        y="75" 
        textAnchor="middle" 
        fontSize="10" 
        fill={stroke}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    )}
  </svg>
);

// Web Page Browser Shape
export const PageShape: React.FC<FlowchartShapeProps> = ({ 
  className = '', 
  fill = '#16a34a', 
  stroke = '#15803d',
  strokeWidth = 2,
  label = '',
  width = 90,
  height = 70
}) => (
  <svg 
    className={className} 
    width={width} 
    height={height} 
    viewBox="0 0 90 70" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Browser window */}
    <rect 
      x={strokeWidth/2} 
      y={strokeWidth/2} 
      width={90-strokeWidth} 
      height={70-strokeWidth} 
      rx="6" 
      fill={fill} 
      stroke={stroke} 
      strokeWidth={strokeWidth}
    />
    {/* Browser header */}
    <rect 
      x={strokeWidth/2} 
      y={strokeWidth/2} 
      width={90-strokeWidth} 
      height="15" 
      rx="6" 
      fill={stroke}
    />
    <rect 
      x={strokeWidth/2} 
      y="8" 
      width={90-strokeWidth} 
      height="15" 
      fill={stroke}
    />
    {/* Browser dots */}
    <circle cx="10" cy="8" r="2" fill="white" />
    <circle cx="18" cy="8" r="2" fill="white" />
    <circle cx="26" cy="8" r="2" fill="white" />
    {label && (
      <text 
        x="45" 
        y="65" 
        textAnchor="middle" 
        fontSize="10" 
        fill={stroke}
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    )}
  </svg>
);