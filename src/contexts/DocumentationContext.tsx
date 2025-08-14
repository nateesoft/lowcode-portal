import React, { createContext, useContext, useState } from 'react';

export interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: DocumentFolder[];
  documents?: Document[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  tags: string[];
  isPublished: boolean;
  coverImage?: string;
  summary?: string;
  readTime?: number;
  viewCount: number;
  lastViewedAt?: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  content: string;
  version: number;
  authorId: string;
  authorName: string;
  createdAt: Date;
  changeLog?: string;
}

interface DocumentationContextType {
  folders: DocumentFolder[];
  documents: Document[];
  currentFolder: DocumentFolder | null;
  currentDocument: Document | null;
  selectedFolderId: string | null;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  
  // Folder operations
  createFolder: (name: string, parentId?: string) => Promise<DocumentFolder>;
  updateFolder: (id: string, updates: Partial<DocumentFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setCurrentFolder: (folder: DocumentFolder | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  
  // Document operations
  createDocument: (title: string, folderId?: string) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  publishDocument: (id: string) => Promise<void>;
  unpublishDocument: (id: string) => Promise<void>;
  duplicateDocument: (id: string) => Promise<Document>;
  
  // View operations
  setViewMode: (mode: 'grid' | 'list') => void;
  searchDocuments: (query: string) => Document[];
  getDocumentsByFolder: (folderId: string | null) => Document[];
  getFolderTree: () => DocumentFolder[];
  
  // Demo data
  generateDemoData: () => void;
}

const DocumentationContext = createContext<DocumentationContextType | undefined>(undefined);

export const DocumentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFolder = async (name: string, parentId?: string): Promise<DocumentFolder> => {
    const newFolder: DocumentFolder = {
      id: `folder_${Date.now()}`,
      name,
      parentId: parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [],
      documents: []
    };
    
    setFolders(prev => [...prev, newFolder]);
    return newFolder;
  };

  const updateFolder = async (id: string, updates: Partial<DocumentFolder>): Promise<void> => {
    setFolders(prev => prev.map(folder => 
      folder.id === id 
        ? { ...folder, ...updates, updatedAt: new Date() }
        : folder
    ));
  };

  const deleteFolder = async (id: string): Promise<void> => {
    // Delete all documents in the folder
    setDocuments(prev => prev.filter(doc => doc.folderId !== id));
    
    // Delete the folder
    setFolders(prev => prev.filter(folder => folder.id !== id));
    
    // Reset current folder if it was deleted
    if (currentFolder?.id === id) {
      setCurrentFolder(null);
    }
  };

  const createDocument = async (title: string, folderId?: string): Promise<Document> => {
    const newDocument: Document = {
      id: `doc_${Date.now()}`,
      title,
      content: '',
      folderId: folderId || null,
      authorId: 'user_1',
      authorName: 'Current User',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      tags: [],
      isPublished: false,
      viewCount: 0
    };
    
    setDocuments(prev => [...prev, newDocument]);
    return newDocument;
  };

  const updateDocument = async (id: string, updates: Partial<Document>): Promise<void> => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: new Date() }
        : doc
    ));
  };

  const deleteDocument = async (id: string): Promise<void> => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    
    if (currentDocument?.id === id) {
      setCurrentDocument(null);
    }
  };

  const publishDocument = async (id: string): Promise<void> => {
    await updateDocument(id, { isPublished: true });
  };

  const unpublishDocument = async (id: string): Promise<void> => {
    await updateDocument(id, { isPublished: false });
  };

  const duplicateDocument = async (id: string): Promise<Document> => {
    const originalDoc = documents.find(doc => doc.id === id);
    if (!originalDoc) {
      throw new Error('Document not found');
    }

    const duplicatedDoc: Document = {
      ...originalDoc,
      id: `doc_${Date.now()}`,
      title: `${originalDoc.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      isPublished: false,
      viewCount: 0
    };

    setDocuments(prev => [...prev, duplicatedDoc]);
    return duplicatedDoc;
  };

  const searchDocuments = (query: string): Document[] => {
    if (!query.trim()) return documents;
    
    const lowercaseQuery = query.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowercaseQuery) ||
      doc.content.toLowerCase().includes(lowercaseQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getDocumentsByFolder = (folderId: string | null): Document[] => {
    return documents.filter(doc => doc.folderId === folderId);
  };

  const getFolderTree = (): DocumentFolder[] => {
    const buildTree = (parentId: string | null = null): DocumentFolder[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id),
          documents: getDocumentsByFolder(folder.id)
        }));
    };

    return buildTree();
  };

  const generateDemoData = (): void => {
    const demoFolders: DocumentFolder[] = [
      {
        id: 'folder_1',
        name: 'Project Specifications',
        parentId: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: 'folder_2',
        name: 'API Documentation',
        parentId: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'folder_3',
        name: 'User Guides',
        parentId: null,
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: 'folder_4',
        name: 'Frontend Specs',
        parentId: 'folder_1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-12'),
      },
      {
        id: 'folder_5',
        name: 'Backend Specs',
        parentId: 'folder_1',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-18'),
      }
    ];

    const demoDocuments: Document[] = [
      {
        id: 'doc_1',
        title: 'System Architecture Overview',
        content: `# System Architecture Overview\n\nThis document provides a comprehensive overview of our system architecture...\n\n## Components\n\n- Frontend: React with TypeScript\n- Backend: Node.js with Express\n- Database: PostgreSQL\n- Cache: Redis`,
        folderId: 'folder_1',
        authorId: 'user_1',
        authorName: 'John Doe',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-25'),
        version: 3,
        tags: ['architecture', 'system', 'overview'],
        isPublished: true,
        summary: 'High-level overview of the system architecture and key components',
        readTime: 5,
        viewCount: 156,
        lastViewedAt: new Date('2024-01-25'),
      },
      {
        id: 'doc_2',
        title: 'REST API Reference',
        content: `# REST API Reference\n\n## Authentication\n\nAll API requests require authentication...\n\n## Endpoints\n\n### Users\n\n#### GET /api/users\n\nReturns a list of users.`,
        folderId: 'folder_2',
        authorId: 'user_2',
        authorName: 'Jane Smith',
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-22'),
        version: 2,
        tags: ['api', 'rest', 'reference'],
        isPublished: true,
        summary: 'Complete reference for all REST API endpoints',
        readTime: 8,
        viewCount: 89,
        lastViewedAt: new Date('2024-01-22'),
      },
      {
        id: 'doc_3',
        title: 'Getting Started Guide',
        content: `# Getting Started Guide\n\nWelcome to our platform! This guide will help you get started...\n\n## Installation\n\n1. Clone the repository\n2. Install dependencies\n3. Configure environment`,
        folderId: 'folder_3',
        authorId: 'user_1',
        authorName: 'John Doe',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-20'),
        version: 1,
        tags: ['guide', 'getting-started', 'tutorial'],
        isPublished: true,
        summary: 'Step-by-step guide for new users',
        readTime: 3,
        viewCount: 234,
        lastViewedAt: new Date('2024-01-23'),
      },
      {
        id: 'doc_4',
        title: 'Frontend Component Library',
        content: `# Frontend Component Library\n\n## Button Component\n\nReusable button component with various styles...\n\n## Form Components\n\nInput fields, dropdowns, and validation components.`,
        folderId: 'folder_4',
        authorId: 'user_3',
        authorName: 'Mike Johnson',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-24'),
        version: 4,
        tags: ['frontend', 'components', 'ui'],
        isPublished: false,
        summary: 'Documentation for reusable frontend components',
        readTime: 6,
        viewCount: 45,
      },
      {
        id: 'doc_5',
        title: 'Database Schema',
        content: `# Database Schema\n\n## Tables\n\n### Users Table\n\n- id: Primary key\n- email: Unique identifier\n- created_at: Timestamp\n\n### Projects Table\n\n- id: Primary key\n- name: Project name\n- user_id: Foreign key`,
        folderId: 'folder_5',
        authorId: 'user_2',
        authorName: 'Jane Smith',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-26'),
        version: 2,
        tags: ['database', 'schema', 'backend'],
        isPublished: true,
        summary: 'Complete database schema documentation',
        readTime: 4,
        viewCount: 67,
        lastViewedAt: new Date('2024-01-26'),
      }
    ];

    setFolders(demoFolders);
    setDocuments(demoDocuments);
  };

  const value: DocumentationContextType = {
    folders,
    documents,
    currentFolder,
    currentDocument,
    selectedFolderId,
    viewMode,
    isLoading,
    error,
    
    createFolder,
    updateFolder,
    deleteFolder,
    setCurrentFolder,
    setSelectedFolderId,
    
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
    getFolderTree,
    
    generateDemoData,
  };

  return (
    <DocumentationContext.Provider value={value}>
      {children}
    </DocumentationContext.Provider>
  );
};

export const useDocumentation = (): DocumentationContextType => {
  const context = useContext(DocumentationContext);
  if (context === undefined) {
    throw new Error('useDocumentation must be used within a DocumentationProvider');
  }
  return context;
};