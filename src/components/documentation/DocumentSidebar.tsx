import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';
import { useDocumentation, DocumentFolder, Document } from '@/contexts/DocumentationContext';

interface DocumentSidebarProps {
  onDocumentSelect: (document: Document) => void;
  onFolderSelect: (folder: DocumentFolder | null) => void;
}

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({ 
  onDocumentSelect, 
  onFolderSelect 
}) => {
  const {
    folders,
    documents,
    currentFolder,
    selectedFolderId,
    createFolder,
    createDocument,
    updateFolder,
    deleteFolder,
    deleteDocument,
    setSelectedFolderId,
    getFolderTree,
    getDocumentsByFolder
  } = useDocumentation();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyPublished, setShowOnlyPublished] = useState(false);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async (parentId?: string) => {
    const name = prompt('Enter folder name:');
    if (name?.trim()) {
      await createFolder(name.trim(), parentId);
      if (parentId) {
        setExpandedFolders(prev => new Set([...prev, parentId]));
      }
    }
  };

  const handleCreateDocument = async (folderId?: string) => {
    const title = prompt('Enter document title:');
    if (title?.trim()) {
      const newDoc = await createDocument(title.trim(), folderId);
      onDocumentSelect(newDoc);
      if (folderId) {
        setExpandedFolders(prev => new Set([...prev, folderId]));
      }
    }
  };

  const startEditingFolder = (folder: DocumentFolder) => {
    setEditingFolder(folder.id);
    setEditingFolderName(folder.name);
  };

  const saveEditingFolder = async () => {
    if (editingFolder && editingFolderName.trim()) {
      await updateFolder(editingFolder, { name: editingFolderName.trim() });
    }
    setEditingFolder(null);
    setEditingFolderName('');
  };

  const cancelEditingFolder = () => {
    setEditingFolder(null);
    setEditingFolderName('');
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Delete this folder and all its contents?')) {
      await deleteFolder(folderId);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Delete this document?')) {
      await deleteDocument(documentId);
    }
  };

  const filterDocuments = (docs: Document[]) => {
    let filtered = docs;
    
    if (showOnlyPublished) {
      filtered = filtered.filter(doc => doc.isPublished);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const renderDocument = (document: Document, level: number = 0) => {
    return (
      <div
        key={document.id}
        className="flex items-center justify-between group hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer"
        style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
        onClick={() => onDocumentSelect(document)}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {document.title}
          </span>
          {!document.isPublished && (
            <EyeOff className="h-3 w-3 text-gray-400" />
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDocumentSelect(document);
            }}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title="Edit"
          >
            <Edit3 className="h-3 w-3 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteDocument(document.id);
            }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            title="Delete"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </button>
        </div>
      </div>
    );
  };

  const renderFolder = (folder: DocumentFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const folderDocuments = filterDocuments(getDocumentsByFolder(folder.id));
    const childFolders = folders.filter(f => f.parentId === folder.id);

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center justify-between group hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 cursor-pointer ${
            isSelected ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => {
            setSelectedFolderId(folder.id);
            onFolderSelect(folder);
          }}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
            
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500 flex-shrink-0" />
            )}
            
            {editingFolder === folder.id ? (
              <input
                type="text"
                value={editingFolderName}
                onChange={(e) => setEditingFolderName(e.target.value)}
                onBlur={saveEditingFolder}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditingFolder();
                  if (e.key === 'Escape') cancelEditingFolder();
                }}
                className="text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded px-1 py-0.5 min-w-0 flex-1"
                autoFocus
              />
            ) : (
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {folder.name}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateDocument(folder.id);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="New Document"
            >
              <Plus className="h-3 w-3 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEditingFolder(folder);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Rename"
            >
              <Edit3 className="h-3 w-3 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(folder.id);
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <Trash2 className="h-3 w-3 text-red-500" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div>
            {/* Child folders */}
            {childFolders.map(childFolder => renderFolder(childFolder, level + 1))}
            
            {/* Documents in this folder */}
            {folderDocuments.map(document => renderDocument(document, level))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter(folder => folder.parentId === null);
  const rootDocuments = filterDocuments(getDocumentsByFolder(null));

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Documentation
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleCreateFolder()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="New Folder"
            >
              <Folder className="h-4 w-4 text-gray-500" />
            </button>
            <button
              onClick={() => handleCreateDocument()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="New Document"
            >
              <Plus className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowOnlyPublished(!showOnlyPublished)}
            className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
              showOnlyPublished
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>Published only</span>
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {/* Root folders */}
          {rootFolders.map(folder => renderFolder(folder))}
          
          {/* Root documents */}
          {rootDocuments.map(document => renderDocument(document))}
          
          {/* Empty state */}
          {rootFolders.length === 0 && rootDocuments.length === 0 && !searchQuery && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No documents yet</p>
              <p className="text-xs">Create your first document or folder</p>
            </div>
          )}
          
          {/* No search results */}
          {searchQuery && (rootFolders.length === 0 && rootDocuments.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No results found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentSidebar;