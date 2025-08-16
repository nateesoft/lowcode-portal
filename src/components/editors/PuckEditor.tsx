'use client';

import React, { useState } from 'react';
import { Puck, Config, Data } from '@measured/puck';
import '@measured/puck/puck.css';
import '../../styles/puck-custom.css';

// Define basic components for the page builder
const config: Config = {
  components: {
    HeadingBlock: {
      fields: {
        children: {
          type: "text",
        },
        level: {
          type: "select",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "H5", value: "h5" },
            { label: "H6", value: "h6" },
          ],
        },
      },
      defaultProps: {
        children: "Heading",
        level: "h1",
      },
      render: ({ children, level }) => {
        const Tag = level as keyof JSX.IntrinsicElements;
        const classes = {
          h1: "text-4xl font-bold mb-6 text-slate-900 dark:text-white",
          h2: "text-3xl font-bold mb-5 text-slate-800 dark:text-slate-100",
          h3: "text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200",
          h4: "text-xl font-bold mb-3 text-slate-600 dark:text-slate-300",
          h5: "text-lg font-bold mb-2 text-slate-600 dark:text-slate-300",
          h6: "text-base font-bold mb-2 text-slate-600 dark:text-slate-300"
        };
        return React.createElement(Tag, { className: classes[level] }, children);
      },
    },
    TextBlock: {
      fields: {
        text: {
          type: "textarea",
        },
      },
      defaultProps: {
        text: "Enter your text here...",
      },
      render: ({ text }) => (
        <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">{text}</p>
      ),
    },
    ButtonBlock: {
      fields: {
        text: {
          type: "text",
        },
        href: {
          type: "text",
        },
        variant: {
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
            { label: "Outline", value: "outline" },
          ],
        },
      },
      defaultProps: {
        text: "Click me",
        href: "#",
        variant: "primary",
      },
      render: ({ text, href, variant }) => {
        const baseClasses = "inline-block px-6 py-3 rounded-lg font-medium transition-all duration-200 cursor-pointer";
        const variantClasses = {
          primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
          secondary: "bg-slate-600 text-white hover:bg-slate-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
          outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-md hover:shadow-lg",
        };
        
        return (
          <a 
            href={href} 
            className={`${baseClasses} ${variantClasses[variant]}`}
          >
            {text}
          </a>
        );
      },
    },
    ImageBlock: {
      fields: {
        src: {
          type: "text",
        },
        alt: {
          type: "text",
        },
        width: {
          type: "number",
        },
        height: {
          type: "number",
        },
      },
      defaultProps: {
        src: "https://via.placeholder.com/400x300",
        alt: "Placeholder image",
        width: 400,
        height: 300,
      },
      render: ({ src, alt, width, height }) => (
        <div className="mb-4">
          <img 
            src={src} 
            alt={alt} 
            width={width} 
            height={height}
            className="max-w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          />
        </div>
      ),
    },
    ContainerBlock: {
      fields: {
        padding: {
          type: "select",
          options: [
            { label: "None", value: "0" },
            { label: "Small", value: "4" },
            { label: "Medium", value: "8" },
            { label: "Large", value: "12" },
          ],
        },
        backgroundColor: {
          type: "select",
          options: [
            { label: "Transparent", value: "transparent" },
            { label: "White", value: "white" },
            { label: "Gray", value: "gray-100" },
            { label: "Blue", value: "blue-50" },
          ],
        },
      },
      defaultProps: {
        padding: "8",
        backgroundColor: "transparent",
      },
      render: ({ children, padding, backgroundColor }) => {
        const paddingClasses: Record<string, string> = {
          '0': 'p-0',
          '4': 'p-4',
          '8': 'p-8',
          '12': 'p-12'
        };
        const paddingClass = paddingClasses[padding as string] || 'p-4';
        
        const bgClasses: Record<string, string> = {
          'transparent': 'bg-transparent',
          'white': 'bg-white dark:bg-slate-800',
          'gray-100': 'bg-slate-100 dark:bg-slate-700',
          'blue-50': 'bg-blue-50 dark:bg-blue-900/20'
        };
        const bgClass = bgClasses[backgroundColor as string] || 'bg-transparent';
        
        return (
          <div className={`${paddingClass} ${bgClass} rounded-lg border border-slate-200 dark:border-slate-600 mb-4`}>
            {children}
          </div>
        );
      },
    },
  },
};

interface PuckEditorProps {
  initialData?: Data;
  onSave?: (data: Data) => void;
  height?: string;
}

const PuckEditor: React.FC<PuckEditorProps> = ({ 
  initialData, 
  onSave,
  height = "600px" 
}) => {
  const [data, setData] = useState<Data>(initialData || {
    content: [],
    root: { props: { title: "" } }
  });

  const handleSave = (newData: Data) => {
    setData(newData);
    if (onSave) {
      onSave(newData);
    }
  };

  return (
    <>
      <style>{`
        .puck-editor-container .Puck,
        .puck-editor-container .Puck * {
          background-color: rgb(30 41 59) !important;
          color: rgb(248 250 252) !important;
        }
        .puck-editor-container .Puck-sidebar {
          background: linear-gradient(180deg, rgb(15 23 42) 0%, rgb(30 41 59) 100%) !important;
        }
        .puck-editor-container .Puck-canvas {
          background: linear-gradient(180deg, rgb(15 23 42) 0%, rgb(30 41 59) 50%, rgb(15 23 42) 100%) !important;
        }
      `}</style>
      <div 
        className="puck-editor-container dark"
        style={{ 
          height,
          overflow: 'hidden',
          borderRadius: '8px',
          backgroundColor: 'rgb(15 23 42)',
          color: 'rgb(248 250 252)'
        }}
      >
      <Puck
        config={config}
        data={data}
        onPublish={handleSave}
        overrides={{
          header: ({ actions }: any) => (
            <div className="flex items-center justify-between p-4 border-b border-slate-600 bg-slate-800" style={{
              background: 'linear-gradient(135deg, rgb(15 23 42) 0%, rgb(30 41 59) 100%)',
              borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(59, 130, 246, 0.1)'
            }}>
              <div className="text-lg font-semibold text-white" style={{
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                background: 'linear-gradient(135deg, rgb(59 130 246) 0%, rgb(147 51 234) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🎨 Page Builder
              </div>
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            </div>
          ),
        } as any}
      />
      </div>
    </>
  );
};

export default PuckEditor;