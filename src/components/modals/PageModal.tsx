import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Settings, FileText, Tag, Globe, Layout, Search } from 'lucide-react';
import { PageData, CreatePageRequest } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';


interface PageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (page: CreatePageRequest) => Promise<void>;
  editingPage?: PageData | null;
  userId?: number;
}

const pageTypes = [
  'standard', 'landing', 'blog', 'product', 'contact', 'about', 
  'portfolio', 'documentation', 'support', 'checkout', 'other'
];

const PageModal: React.FC<PageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPage,
  userId = 1
}) => {
  const { showError } = useAlert();
  const [formData, setFormData] = useState<CreatePageRequest>({
    title: '',
    slug: '',
    description: '',
    content: {},
    layout: {},
    components: {},
    styles: {},
    customCSS: '',
    customJS: '',
    status: 'draft',
    isPublic: false,
    tags: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: [],
    pageType: 'standard',
    routePath: '',
    userId,
    changeDescription: ''
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'design' | 'seo' | 'settings'>('basic');
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [contentText, setContentText] = useState('{}');
  const [layoutText, setLayoutText] = useState('{}');
  const [componentsText, setComponentsText] = useState('{}');
  const [stylesText, setStylesText] = useState('{}');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingPage) {
      setFormData({
        title: editingPage.title,
        slug: editingPage.slug,
        description: editingPage.description || '',
        content: editingPage.content || {},
        layout: editingPage.layout || {},
        components: editingPage.components || {},
        styles: editingPage.styles || {},
        customCSS: editingPage.customCSS || '',
        customJS: editingPage.customJS || '',
        status: editingPage.status || 'draft',
        isPublic: editingPage.isPublic || false,
        tags: editingPage.tags || [],
        seoTitle: editingPage.seoTitle || '',
        seoDescription: editingPage.seoDescription || '',
        seoKeywords: editingPage.seoKeywords || [],
        pageType: editingPage.pageType || 'standard',
        routePath: editingPage.routePath || '',
        userId,
        changeDescription: ''
      });
      setContentText(JSON.stringify(editingPage.content || {}, null, 2));
      setLayoutText(JSON.stringify(editingPage.layout || {}, null, 2));
      setComponentsText(JSON.stringify(editingPage.components || {}, null, 2));
      setStylesText(JSON.stringify(editingPage.styles || {}, null, 2));
    } else {
      // Reset for new page
      setFormData({
        title: '',
        slug: '',
        description: '',
        content: {},
        layout: {},
        components: {},
        styles: {},
        customCSS: '',
        customJS: '',
        status: 'draft',
        isPublic: false,
        tags: [],
        seoTitle: '',
        seoDescription: '',
        seoKeywords: [],
        pageType: 'standard',
        routePath: '',
        userId,
        changeDescription: ''
      });
      setContentText('{}');
      setLayoutText('{}');
      setComponentsText('{}');
      setStylesText('{}');
    }
    setTagInput('');
    setKeywordInput('');
  }, [editingPage, userId, isOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !editingPage ? generateSlug(title) : prev.slug // Only auto-generate for new pages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Parse JSON fields
      let content = {};
      let layout = {};
      let components = {};
      let styles = {};
      
      try {
        content = JSON.parse(contentText);
      } catch (e) {
        showError('Invalid JSON in content field');
        setIsLoading(false);
        return;
      }
      
      try {
        layout = JSON.parse(layoutText);
      } catch (e) {
        showError('Invalid JSON in layout field');
        setIsLoading(false);
        return;
      }

      try {
        components = JSON.parse(componentsText);
      } catch (e) {
        showError('Invalid JSON in components field');
        setIsLoading(false);
        return;
      }
      
      try {
        styles = JSON.parse(stylesText);
      } catch (e) {
        showError('Invalid JSON in styles field');
        setIsLoading(false);
        return;
      }

      const pageData = {
        ...formData,
        content,
        layout,
        components,
        styles,
        changeDescription: formData.changeDescription || (editingPage ? 'Page updated' : 'Page created')
      };

      await onSave(pageData);
      onClose();
    } catch (error) {
      console.error('Error saving page:', error);
      showError('Failed to save page');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords?.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...(prev.seoKeywords || []), keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords?.filter(keyword => keyword !== keywordToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {editingPage ? 'Edit Page' : 'Create New Page'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-200px)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { key: 'basic', label: 'Basic Info', icon: FileText },
              { key: 'content', label: 'Content', icon: Layout },
              { key: 'design', label: 'Design', icon: Palette },
              { key: 'seo', label: 'SEO', icon: Search },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Page Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter page title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="page-slug"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Page Type *
                    </label>
                    <select
                      value={formData.pageType}
                      onChange={(e) => setFormData({ ...formData, pageType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      required
                    >
                      {pageTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Describe what this page is about..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Route Path
                  </label>
                  <input
                    type="text"
                    value={formData.routePath}
                    onChange={(e) => setFormData({ ...formData, routePath: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="/path/to/page"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags?.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Page Content (JSON)
                    </label>
                    <textarea
                      value={contentText}
                      onChange={(e) => setContentText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={8}
                      placeholder='{\n  "sections": [],\n  "blocks": []\n}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Layout Configuration (JSON)
                    </label>
                    <textarea
                      value={layoutText}
                      onChange={(e) => setLayoutText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={8}
                      placeholder='{\n  "type": "standard",\n  "header": true,\n  "footer": true\n}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Components Map (JSON)
                    </label>
                    <textarea
                      value={componentsText}
                      onChange={(e) => setComponentsText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={6}
                      placeholder='{\n  "hero": "hero-component-1",\n  "footer": "footer-component-2"\n}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Page Styles (JSON)
                    </label>
                    <textarea
                      value={stylesText}
                      onChange={(e) => setStylesText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={6}
                      placeholder='{\n  "theme": "modern",\n  "primaryColor": "#007bff"\n}'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Custom CSS
                  </label>
                  <textarea
                    value={formData.customCSS}
                    onChange={(e) => setFormData({ ...formData, customCSS: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                    rows={8}
                    placeholder="/* Add your custom CSS here */&#10;.my-class {&#10;  color: blue;&#10;}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Custom JavaScript
                  </label>
                  <textarea
                    value={formData.customJS}
                    onChange={(e) => setFormData({ ...formData, customJS: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                    rows={8}
                    placeholder="// Add your custom JavaScript here&#10;document.addEventListener('DOMContentLoaded', function() {&#10;  console.log('Page loaded');&#10;});"
                  />
                </div>
              </div>
            )}


            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="SEO optimized title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="SEO meta description (150-160 characters recommended)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    SEO Keywords
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.seoKeywords?.map(keyword => (
                      <span
                        key={keyword}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Add SEO keyword..."
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-slate-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">Public Page</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Make this page accessible to all users</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="https://example.com/page-thumbnail.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Change Description
                  </label>
                  <input
                    type="text"
                    value={formData.changeDescription}
                    onChange={(e) => setFormData({ ...formData, changeDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Describe what changed in this version..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageModal;