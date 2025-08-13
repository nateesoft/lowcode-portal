import React from 'react';
import { Globe } from 'lucide-react';
import { WebsiteTemplate } from '../types';

interface TemplateSelectorProps {
  showTemplateSelector: boolean;
  selectedTemplate: string;
  websiteTemplates: { [key: string]: WebsiteTemplate };
  onClose: () => void;
  onTemplateSelect: (templateId: string) => void;
  onGenerateWebsite: (templateId: string) => void;
  isGeneratingWebsite: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  showTemplateSelector,
  selectedTemplate,
  websiteTemplates,
  onClose,
  onTemplateSelect,
  onGenerateWebsite,
  isGeneratingWebsite
}) => {
  if (!showTemplateSelector) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Template Selector */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  🎨 เลือก Template สำหรับเว็บไซต์
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  เลือกเทมเพลตที่คุณต้องการสำหรับเว็บไซต์ของคุณ
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <div className="w-6 h-6">✕</div>
              </button>
            </div>
          </div>

          {/* Template Grid */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(websiteTemplates).map(([templateId, template]) => (
                <div
                  key={templateId}
                  className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                    selectedTemplate === templateId
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => onTemplateSelect(templateId)}
                >
                  {/* Template Preview */}
                  <div 
                    className="w-full h-32 rounded-lg mb-4 flex items-center justify-center text-4xl"
                    style={{ 
                      backgroundColor: template.backgroundColor,
                      color: template.primaryColor,
                      fontFamily: template.fontFamily
                    }}
                  >
                    {template.preview}
                  </div>
                  
                  {/* Template Info */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {template.description}
                    </p>
                    
                    {/* Template Features */}
                    <div className="text-xs space-y-1">
                      <div style={{ color: template.primaryColor }} className="font-medium">
                        Primary: {template.primaryColor}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        Font: {template.fontFamily.split(',')[0]}
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Indicator */}
                  {selectedTemplate === templateId && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Template ที่เลือก: <strong>{websiteTemplates[selectedTemplate]?.name}</strong>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => onGenerateWebsite(selectedTemplate)}
                  disabled={isGeneratingWebsite}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                >
                  {isGeneratingWebsite ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      สร้างเว็บไซต์...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      สร้างเว็บไซต์
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateSelector;