import React, { useState } from 'react';
import { Palette, Layout, Type, Box } from 'lucide-react';

interface StyleEditorProps {
  element: any;
  onStyleUpdate: (styles: any) => void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ element, onStyleUpdate }) => {
  const [activeTab, setActiveTab] = useState<'layout' | 'typography' | 'colors' | 'spacing'>('layout');
  const [styles, setStyles] = useState(element?.styles || {});

  const updateStyle = (property: string, value: string) => {
    const newStyles = { ...styles, [property]: value };
    setStyles(newStyles);
    onStyleUpdate(newStyles);
  };

  const renderLayoutControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Display</label>
        <select
          value={styles.display || 'block'}
          onChange={(e) => updateStyle('display', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="block">Block</option>
          <option value="inline">Inline</option>
          <option value="inline-block">Inline Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
          <option value="none">None</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
        <select
          value={styles.position || 'static'}
          onChange={(e) => updateStyle('position', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="static">Static</option>
          <option value="relative">Relative</option>
          <option value="absolute">Absolute</option>
          <option value="fixed">Fixed</option>
          <option value="sticky">Sticky</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Width</label>
          <input
            type="text"
            value={styles.width || ''}
            onChange={(e) => updateStyle('width', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="auto"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
          <input
            type="text"
            value={styles.height || ''}
            onChange={(e) => updateStyle('height', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="auto"
          />
        </div>
      </div>

      {styles.display === 'flex' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Flex Direction</label>
            <select
              value={styles.flexDirection || 'row'}
              onChange={(e) => updateStyle('flexDirection', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Justify Content</label>
            <select
              value={styles.justifyContent || 'flex-start'}
              onChange={(e) => updateStyle('justifyContent', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="flex-start">Flex Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex End</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Align Items</label>
            <select
              value={styles.alignItems || 'stretch'}
              onChange={(e) => updateStyle('alignItems', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="center">Center</option>
              <option value="flex-end">Flex End</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>
        </>
      )}
    </div>
  );

  const renderTypographyControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
        <select
          value={styles.fontFamily || 'inherit'}
          onChange={(e) => updateStyle('fontFamily', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="inherit">Inherit</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="'Helvetica', sans-serif">Helvetica</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
          <input
            type="text"
            value={styles.fontSize || ''}
            onChange={(e) => updateStyle('fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="16px"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
          <select
            value={styles.fontWeight || 'normal'}
            onChange={(e) => updateStyle('fontWeight', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="lighter">Lighter</option>
            <option value="bolder">Bolder</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
        <select
          value={styles.textAlign || 'left'}
          onChange={(e) => updateStyle('textAlign', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Line Height</label>
        <input
          type="text"
          value={styles.lineHeight || ''}
          onChange={(e) => updateStyle('lineHeight', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="1.5"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Letter Spacing</label>
        <input
          type="text"
          value={styles.letterSpacing || ''}
          onChange={(e) => updateStyle('letterSpacing', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="normal"
        />
      </div>
    </div>
  );

  const renderColorControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={styles.color || '#000000'}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={styles.color || ''}
            onChange={(e) => updateStyle('color', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={styles.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={styles.backgroundColor || ''}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={styles.borderColor || '#d1d5db'}
            onChange={(e) => updateStyle('borderColor', e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded"
          />
          <input
            type="text"
            value={styles.borderColor || ''}
            onChange={(e) => updateStyle('borderColor', e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="#d1d5db"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={styles.opacity || 1}
          onChange={(e) => updateStyle('opacity', e.target.value)}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{styles.opacity || 1}</div>
      </div>
    </div>
  );

  const renderSpacingControls = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={styles.marginTop || ''}
            onChange={(e) => updateStyle('marginTop', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Top"
          />
          <input
            type="text"
            value={styles.marginRight || ''}
            onChange={(e) => updateStyle('marginRight', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Right"
          />
          <input
            type="text"
            value={styles.marginBottom || ''}
            onChange={(e) => updateStyle('marginBottom', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Bottom"
          />
          <input
            type="text"
            value={styles.marginLeft || ''}
            onChange={(e) => updateStyle('marginLeft', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Left"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={styles.paddingTop || ''}
            onChange={(e) => updateStyle('paddingTop', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Top"
          />
          <input
            type="text"
            value={styles.paddingRight || ''}
            onChange={(e) => updateStyle('paddingRight', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Right"
          />
          <input
            type="text"
            value={styles.paddingBottom || ''}
            onChange={(e) => updateStyle('paddingBottom', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Bottom"
          />
          <input
            type="text"
            value={styles.paddingLeft || ''}
            onChange={(e) => updateStyle('paddingLeft', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Left"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Border</label>
        <div className="space-y-2">
          <input
            type="text"
            value={styles.borderWidth || ''}
            onChange={(e) => updateStyle('borderWidth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Border Width (e.g., 1px)"
          />
          <select
            value={styles.borderStyle || 'solid'}
            onChange={(e) => updateStyle('borderStyle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">None</option>
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
        <input
          type="text"
          value={styles.borderRadius || ''}
          onChange={(e) => updateStyle('borderRadius', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 4px"
        />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'layout'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layout className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setActiveTab('typography')}
            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'typography'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Type className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'colors'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Palette className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={() => setActiveTab('spacing')}
            className={`flex-1 py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'spacing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Box className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'layout' && renderLayoutControls()}
        {activeTab === 'typography' && renderTypographyControls()}
        {activeTab === 'colors' && renderColorControls()}
        {activeTab === 'spacing' && renderSpacingControls()}
      </div>
    </div>
  );
};

export default StyleEditor;