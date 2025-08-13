import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NodeCategory } from '../types';

interface NodePaletteProps {
  nodeCategories: NodeCategory[];
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryTitle: string) => void;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({
  nodeCategories,
  collapsedCategories,
  onToggleCategory,
  onDragStart
}) => {
  return (
    <div className="space-y-2">
      {nodeCategories.map((category) => {
        const isCollapsed = collapsedCategories.has(category.title);
        return (
          <div key={category.title} className="border border-slate-200 dark:border-slate-700 rounded-lg">
            <button
              onClick={() => onToggleCategory(category.title)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-t-lg"
            >
              <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                {category.title}
              </h4>
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              )}
            </button>
            
            {!isCollapsed && (
              <div className="p-3 pt-0 space-y-2">
                {category.items.map((item) => (
                  <div
                    key={item}
                    className="w-full text-left px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors cursor-move"
                    draggable
                    onDragStart={(event) => onDragStart(event, item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NodePalette;