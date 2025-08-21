import React, { useState } from 'react';
import { 
  Layout, Type, Image, Square, ChevronDown, ChevronRight,
  MousePointer, Grid, List, Play, CheckSquare, Calendar,
  BarChart, Map, Video, Music, FileText, Link
} from 'lucide-react';

interface ElementPaletteProps {
  onElementAdd: (elementType: string) => void;
}

const elementGroups = [
  {
    name: "Layout Elements",
    icon: Layout,
    elements: [
      { id: "container", name: "Container", icon: Layout, tag: "div", type: "layout" },
      { id: "section", name: "Section", icon: Layout, tag: "section", type: "layout" },
      { id: "header", name: "Header", icon: Layout, tag: "header", type: "layout" },
      { id: "main", name: "Main", icon: Layout, tag: "main", type: "layout" },
      { id: "footer", name: "Footer", icon: Layout, tag: "footer", type: "layout" },
      { id: "aside", name: "Sidebar", icon: Layout, tag: "aside", type: "layout" },
      { id: "grid", name: "Grid", icon: Grid, tag: "div", type: "layout" },
      { id: "flex", name: "Flex Container", icon: Square, tag: "div", type: "layout" }
    ]
  },
  {
    name: "Text Elements",
    icon: Type,
    elements: [
      { id: "heading", name: "Heading", icon: Type, tag: "h1", type: "text" },
      { id: "paragraph", name: "Paragraph", icon: Type, tag: "p", type: "text" },
      { id: "span", name: "Span", icon: Type, tag: "span", type: "text" },
      { id: "blockquote", name: "Quote", icon: Type, tag: "blockquote", type: "text" },
      { id: "code", name: "Code", icon: FileText, tag: "code", type: "text" },
      { id: "pre", name: "Preformatted", icon: FileText, tag: "pre", type: "text" }
    ]
  },
  {
    name: "Media Elements",
    icon: Image,
    elements: [
      { id: "image", name: "Image", icon: Image, tag: "img", type: "media" },
      { id: "video", name: "Video", icon: Video, tag: "video", type: "media" },
      { id: "audio", name: "Audio", icon: Music, tag: "audio", type: "media" },
      { id: "iframe", name: "Embedded Content", icon: Square, tag: "iframe", type: "media" }
    ]
  },
  {
    name: "Form Elements",
    icon: CheckSquare,
    elements: [
      { id: "form", name: "Form", icon: CheckSquare, tag: "form", type: "form" },
      { id: "input", name: "Input", icon: MousePointer, tag: "input", type: "form" },
      { id: "textarea", name: "Textarea", icon: FileText, tag: "textarea", type: "form" },
      { id: "select", name: "Select", icon: List, tag: "select", type: "form" },
      { id: "button", name: "Button", icon: MousePointer, tag: "button", type: "form" },
      { id: "checkbox", name: "Checkbox", icon: CheckSquare, tag: "input", type: "form" },
      { id: "radio", name: "Radio", icon: MousePointer, tag: "input", type: "form" },
      { id: "label", name: "Label", icon: Type, tag: "label", type: "form" }
    ]
  },
  {
    name: "Interactive Elements",
    icon: MousePointer,
    elements: [
      { id: "link", name: "Link", icon: Link, tag: "a", type: "interactive" },
      { id: "nav", name: "Navigation", icon: List, tag: "nav", type: "interactive" },
      { id: "menu", name: "Menu", icon: List, tag: "ul", type: "interactive" },
      { id: "tabs", name: "Tabs", icon: Square, tag: "div", type: "interactive" },
      { id: "accordion", name: "Accordion", icon: List, tag: "div", type: "interactive" },
      { id: "modal", name: "Modal", icon: Square, tag: "div", type: "interactive" }
    ]
  },
  {
    name: "Data Elements",
    icon: BarChart,
    elements: [
      { id: "table", name: "Table", icon: Grid, tag: "table", type: "data" },
      { id: "list", name: "List", icon: List, tag: "ul", type: "data" },
      { id: "chart", name: "Chart", icon: BarChart, tag: "div", type: "data" },
      { id: "progress", name: "Progress Bar", icon: BarChart, tag: "progress", type: "data" },
      { id: "meter", name: "Meter", icon: BarChart, tag: "meter", type: "data" }
    ]
  }
];

const ElementPalette: React.FC<ElementPaletteProps> = ({ onElementAdd }) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['Layout Elements', 'Text Elements'])
  );

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleElementDrag = (elementType: string) => {
    onElementAdd(elementType);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {elementGroups.map(group => {
        const isExpanded = expandedGroups.has(group.name);
        const IconComponent = group.icon;

        return (
          <div key={group.name} className="border-b border-gray-100 last:border-b-0">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.name)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IconComponent className="w-4 h-4 text-gray-500" />
                <span className="font-medium text-sm text-gray-900">{group.name}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Group Elements */}
            {isExpanded && (
              <div className="pb-2">
                {group.elements.map(element => {
                  const ElementIcon = element.icon;
                  return (
                    <div
                      key={element.id}
                      className="mx-2 mb-1 p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-sm hover:border-blue-300 transition-all bg-white"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', element.id);
                      }}
                      onClick={() => handleElementDrag(element.id)}
                    >
                      <div className="flex items-center gap-3">
                        <ElementIcon className="w-4 h-4 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900">
                            {element.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            &lt;{element.tag}&gt;
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ElementPalette;