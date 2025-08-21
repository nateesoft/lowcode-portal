import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Search, Palette, Code, Eye } from 'lucide-react';
import { PageData, CreatePageRequest } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

// Import forms
import PageSettingsForm from './forms/PageSettingsForm';
import SEOForm from './forms/SEOForm';

// Import builder
import VisualBuilder from './builder/VisualBuilder';

interface PageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (page: CreatePageRequest) => Promise<void>;
  editingPage?: PageData | null;
  userId?: number;
}

const PageBuilderModal: React.FC<PageBuilderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPage,
  userId
}) => {
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // Active tab state
  const [activeTab, setActiveTab] = useState<'settings' | 'seo' | 'builder' | 'code' | 'preview'>('settings');
  
  // Form state
  const [pageData, setPageData] = useState<Partial<CreatePageRequest>>({
    title: '',
    slug: '',
    description: '',
    pageType: 'standard',
    routePath: '',
    status: 'draft',
    isPublic: false,
    tags: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    socialImage: '',
    content: { elements: [] },
    layout: {},
    components: {},
    styles: {},
    customCSS: '',
    customJS: '',
    metadata: {},
    userId: userId || user?.id
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (editingPage) {
      setPageData({
        title: editingPage.title || '',
        slug: editingPage.slug || '',
        description: editingPage.description || '',
        pageType: editingPage.pageType || 'standard',
        routePath: editingPage.routePath || '',
        status: editingPage.status || 'draft',
        isPublic: editingPage.isPublic || false,
        tags: editingPage.tags || [],
        seoTitle: editingPage.seoTitle || '',
        seoDescription: editingPage.seoDescription || '',
        seoKeywords: editingPage.seoKeywords || [],
        socialImage: editingPage.socialImage || '',
        content: editingPage.content || { elements: [] },
        layout: editingPage.layout || {},
        components: editingPage.components || {},
        styles: editingPage.styles || {},
        customCSS: editingPage.customCSS || '',
        customJS: editingPage.customJS || '',
        metadata: editingPage.metadata || {},
        userId: editingPage.createdBy?.id || userId || user?.id
      });
    } else {
      // Reset for new page
      setPageData({
        title: '',
        slug: '',
        description: '',
        pageType: 'standard',
        routePath: '',
        status: 'draft',
        isPublic: false,
        tags: [],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
        socialImage: '',
        content: { elements: [] },
        layout: {},
        components: {},
        styles: {},
        customCSS: '',
        customJS: '',
        metadata: {},
        userId: userId || user?.id
      });
    }
  }, [editingPage, userId, user?.id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (pageData.title && !editingPage) {
      const slug = pageData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setPageData(prev => ({ ...prev, slug }));
    }
  }, [pageData.title, editingPage]);

  // Auto-generate route path from slug
  useEffect(() => {
    if (pageData.slug) {
      const routePath = `/${pageData.slug}`;
      setPageData(prev => ({ ...prev, routePath }));
    }
  }, [pageData.slug]);

  const handleSave = async () => {
    if (!pageData.title || !pageData.slug) {
      showAlert('Please fill in required fields (Title and Slug)', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(pageData as CreatePageRequest);
      showAlert('Page saved successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      showAlert('Failed to save page', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'builder', label: 'Builder', icon: Palette },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return (
          <PageSettingsForm
            title={pageData.title || ''}
            slug={pageData.slug || ''}
            description={pageData.description || ''}
            pageType={pageData.pageType || 'standard'}
            routePath={pageData.routePath || ''}
            status={pageData.status || 'draft'}
            isPublic={pageData.isPublic || false}
            tags={pageData.tags || []}
            onTitleChange={(title) => setPageData(prev => ({ ...prev, title }))}
            onSlugChange={(slug) => setPageData(prev => ({ ...prev, slug }))}
            onDescriptionChange={(description) => setPageData(prev => ({ ...prev, description }))}
            onPageTypeChange={(pageType) => setPageData(prev => ({ ...prev, pageType }))}
            onRoutePathChange={(routePath) => setPageData(prev => ({ ...prev, routePath }))}
            onStatusChange={(status) => setPageData(prev => ({ ...prev, status }))}
            onPublicChange={(isPublic) => setPageData(prev => ({ ...prev, isPublic }))}
            onTagsChange={(tags) => setPageData(prev => ({ ...prev, tags }))}
          />
        );

      case 'seo':
        return (
          <SEOForm
            seoTitle={pageData.seoTitle || ''}
            seoDescription={pageData.seoDescription || ''}
            seoKeywords={pageData.seoKeywords || []}
            socialImage={pageData.socialImage || ''}
            onSeoTitleChange={(seoTitle) => setPageData(prev => ({ ...prev, seoTitle }))}
            onSeoDescriptionChange={(seoDescription) => setPageData(prev => ({ ...prev, seoDescription }))}
            onSeoKeywordsChange={(seoKeywords) => setPageData(prev => ({ ...prev, seoKeywords }))}
            onSocialImageChange={(socialImage) => setPageData(prev => ({ ...prev, socialImage }))}
          />
        );

      case 'builder':
        return (
          <VisualBuilder
            content={pageData.content}
            layout={pageData.layout}
            components={pageData.components}
            styles={pageData.styles}
            onContentChange={(content) => setPageData(prev => ({ ...prev, content }))}
            onLayoutChange={(layout) => setPageData(prev => ({ ...prev, layout }))}
            onComponentsChange={(components) => setPageData(prev => ({ ...prev, components }))}
            onStylesChange={(styles) => setPageData(prev => ({ ...prev, styles }))}
          />
        );

      case 'code':
        return (
          <div className="h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom CSS</label>
                <textarea
                  value={pageData.customCSS || ''}
                  onChange={(e) => setPageData(prev => ({ ...prev, customCSS: e.target.value }))}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="/* Add your custom CSS here */"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom JavaScript</label>
                <textarea
                  value={pageData.customJS || ''}
                  onChange={(e) => setPageData(prev => ({ ...prev, customJS: e.target.value }))}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="// Add your custom JavaScript here"
                />
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="h-full bg-gray-50 p-4">
            <div className="h-full bg-white rounded-lg shadow-sm overflow-auto">
              <iframe
                srcDoc={generatePreviewHTML()}
                className="w-full h-full border-0"
                title="Page Preview"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const generatePreviewHTML = () => {
    // This would generate HTML from the page content
    // For now, return a simple preview
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pageData.title || 'Preview'}</title>
          <meta name="description" content="${pageData.seoDescription || ''}" />
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            ${pageData.customCSS || ''}
          </style>
        </head>
        <body>
          <h1>${pageData.title || 'Page Title'}</h1>
          <p>${pageData.description || 'Page description'}</p>
          <!-- Page content would be rendered here -->
          <script>
            ${pageData.customJS || ''}
          </script>
        </body>
      </html>
    `;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {pageData.title || 'Untitled Page'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default PageBuilderModal;