import React, { useState } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  SortAsc, 
  Plus, 
  FileText,
  Calendar,
  User,
  Eye,
  Layout
} from 'lucide-react';
import { useDocumentation, Document } from '@/contexts/DocumentationContext';
import DocumentSidebar from './DocumentSidebar';
import DocumentCard from './DocumentCard';
import DocumentEditor from './DocumentEditor';

interface DocumentationViewProps {
  onCreateDocument: () => void;
}

const DocumentationView: React.FC<DocumentationViewProps> = ({ onCreateDocument }) => {
  const {
    documents,
    currentDocument,
    currentFolder,
    selectedFolderId,
    viewMode,
    isLoading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    setCurrentDocument,
    publishDocument,
    unpublishDocument,
    duplicateDocument,
    setViewMode,
    searchDocuments,
    getDocumentsByFolder,
    generateDemoData
  } = useDocumentation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'updatedAt' | 'viewCount'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'published' | 'draft'>('all');
  const [showEditor, setShowEditor] = useState(false);

  const handleDocumentSelect = (document: Document) => {
    setCurrentDocument(document);
    setShowEditor(true);
  };

  const handleFolderSelect = () => {
    // Handle folder selection if needed
  };

  const handleCreateNewDocument = async () => {
    const title = prompt('Enter document title:');
    if (title?.trim()) {
      const newDoc = await createDocument(title.trim(), selectedFolderId || undefined);
      handleDocumentSelect(newDoc);
    }
  };

  const handleSaveDocument = async (updates: Partial<Document>) => {
    if (currentDocument) {
      await updateDocument(currentDocument.id, updates);
      setCurrentDocument({ ...currentDocument, ...updates });
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  const handleDuplicateDocument = async (id: string) => {
    const duplicated = await duplicateDocument(id);
    handleDocumentSelect(duplicated);
  };

  const getFilteredAndSortedDocuments = () => {
    let filtered = searchQuery 
      ? searchDocuments(searchQuery)
      : getDocumentsByFolder(selectedFolderId);

    // Apply filters
    if (filterBy === 'published') {
      filtered = filtered.filter(doc => doc.isPublished);
    } else if (filterBy === 'draft') {
      filtered = filtered.filter(doc => !doc.isPublished);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  const filteredDocuments = getFilteredAndSortedDocuments();

  if (showEditor && currentDocument) {
    return (
      <DocumentEditor
        document={currentDocument}
        onSave={handleSaveDocument}
        onClose={() => {
          setShowEditor(false);
          setCurrentDocument(null);
        }}
        onPublish={publishDocument}
        onUnpublish={unpublishDocument}
      />
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <DocumentSidebar
        onDocumentSelect={handleDocumentSelect}
        onFolderSelect={handleFolderSelect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentFolder ? currentFolder.name : 'All Documents'}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredDocuments.length} documents
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => generateDemoData()}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Load Demo</span>
            </button>
            <button
              onClick={handleCreateNewDocument}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Document</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white w-64"
              />
            </div>

            {/* Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'published' | 'draft')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Documents</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'title' | 'updatedAt' | 'viewCount');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            >
              <option value="updatedAt-desc">Latest Updated</option>
              <option value="updatedAt-asc">Oldest Updated</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="viewCount-desc">Most Viewed</option>
              <option value="viewCount-asc">Least Viewed</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No documents found' : 'No documents yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search criteria' 
                  : 'Create your first document to get started'
                }
              </p>
              {!searchQuery && (
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => generateDemoData()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Load Demo Documents
                  </button>
                  <button
                    onClick={handleCreateNewDocument}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create First Document
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredDocuments.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  viewMode={viewMode}
                  onView={handleDocumentSelect}
                  onEdit={handleDocumentSelect}
                  onDelete={handleDeleteDocument}
                  onDuplicate={handleDuplicateDocument}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentationView;