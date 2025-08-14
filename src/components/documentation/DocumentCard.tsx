import React from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  Clock, 
  Eye, 
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Share,
  Tag,
  Globe,
  Lock
} from 'lucide-react';
import { Document } from '@/contexts/DocumentationContext';

interface DocumentCardProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onView: (document: Document) => void;
  viewMode: 'grid' | 'list';
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  viewMode
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const getReadTimeText = (minutes?: number) => {
    if (!minutes) return 'Quick read';
    if (minutes < 1) return '< 1 min read';
    return `${Math.round(minutes)} min read`;
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 group">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {document.coverImage ? (
              <img
                src={document.coverImage}
                alt={document.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 
                className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={() => onView(document)}
              >
                {document.title}
              </h3>
              {document.isPublished ? (
                <Globe className="h-4 w-4 text-green-500" title="Published" />
              ) : (
                <Lock className="h-4 w-4 text-gray-400" title="Draft" />
              )}
            </div>
            
            {document.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-1">
                {document.summary}
              </p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{document.authorName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(document.updatedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{getReadTimeText(document.readTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{document.viewCount} views</span>
              </div>
            </div>
          </div>

          {document.tags.length > 0 && (
            <div className="flex items-center space-x-1 flex-shrink-0">
              {document.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {document.tags.length > 2 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{document.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onView(document)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="View"
          >
            <Eye className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => onEdit(document)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Edit"
          >
            <Edit3 className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDuplicate(document.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Duplicate"
          >
            <Copy className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow group overflow-hidden">
      {/* Cover Image */}
      {document.coverImage ? (
        <img
          src={document.coverImage}
          alt={document.title}
          className="w-full h-32 object-cover cursor-pointer"
          onClick={() => onView(document)}
        />
      ) : (
        <div 
          className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center cursor-pointer"
          onClick={() => onView(document)}
        >
          <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 
              className="text-lg font-semibold text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              onClick={() => onView(document)}
            >
              {document.title}
            </h3>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {document.isPublished ? (
              <Globe className="h-4 w-4 text-green-500" title="Published" />
            ) : (
              <Lock className="h-4 w-4 text-gray-400" title="Draft" />
            )}
            
            <div className="relative group/more">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-10">
                <button
                  onClick={() => onEdit(document)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDuplicate(document.id)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="h-4 w-4" />
                  <span>Duplicate</span>
                </button>
                <button
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Share className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onDelete(document.id)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        {document.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {document.summary}
          </p>
        )}

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex items-center space-x-1 mb-3 flex-wrap">
            {document.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{document.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{document.authorName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{getReadTimeText(document.readTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{document.viewCount}</span>
            </div>
            <span>{formatDate(document.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;