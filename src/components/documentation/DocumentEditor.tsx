import React, { useState, useRef } from 'react';
import { 
  Save, 
  Eye, 
  Globe, 
  Lock, 
  Image, 
  Video, 
  Table, 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  X,
  Plus,
  Tag,
  Settings
} from 'lucide-react';
import { Document } from '@/contexts/DocumentationContext';

interface DocumentEditorProps {
  document: Document | null;
  onSave: (updates: Partial<Document>) => void;
  onClose: () => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  onSave,
  onClose,
  onPublish,
  onUnpublish
}) => {
  const [title, setTitle] = useState(document?.title || 'Untitled Document');
  const [content, setContent] = useState(document?.content || '');
  const [summary, setSummary] = useState(document?.summary || '');
  const [tags, setTags] = useState<string[]>(document?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!document) return;
    
    onSave({
      title,
      content,
      summary,
      tags,
      readTime: calculateReadTime(content)
    });
  };

  const calculateReadTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = content;
    
    const newContent = 
      currentContent.substring(0, start) + 
      textToInsert + 
      currentContent.substring(end);
    
    setContent(newContent);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + textToInsert.length, 
        start + textToInsert.length
      );
    }, 0);
  };

  const formatText = (format: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let formattedText = '';
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'h3':
        formattedText = `### ${selectedText}`;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'ul':
        formattedText = `- ${selectedText}`;
        break;
      case 'ol':
        formattedText = `1. ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      default:
        formattedText = selectedText;
    }
    
    insertTextAtCursor(formattedText);
  };

  const insertImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file and get a URL
      const imageUrl = URL.createObjectURL(file);
      insertTextAtCursor(`![${file.name}](${imageUrl})`);
    }
  };

  const insertTable = () => {
    const tableMarkdown = `
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
`;
    insertTextAtCursor(tableMarkdown);
  };

  const insertVideo = () => {
    const videoUrl = prompt('Enter video URL:');
    if (videoUrl) {
      insertTextAtCursor(`<video controls width="100%">
  <source src="${videoUrl}" type="video/mp4">
  Your browser does not support the video tag.
</video>`);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const renderPreview = () => {
    // Simple markdown to HTML conversion for preview
    let html = content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" style="max-width: 100%; height: auto;" />')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
      .replace(/`(.*?)`/gim, '<code>$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/\n/gim, '<br>');

    return { __html: html };
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Document Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a document to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white flex-1 min-w-0"
            placeholder="Document title..."
          />
          
          <div className="flex items-center space-x-2">
            {document.isPublished ? (
              <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm">
                <Globe className="h-4 w-4" />
                <span>Published</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                <Lock className="h-4 w-4" />
                <span>Draft</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isPreview
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Settings className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>

          {document.isPublished ? (
            <button
              onClick={() => onUnpublish(document.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Lock className="h-4 w-4" />
              <span>Unpublish</span>
            </button>
          ) : (
            <button
              onClick={() => onPublish(document.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span>Publish</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief description of this document..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                rows={2}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <button
                  onClick={addTag}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!isPreview && (
        <div className="flex items-center space-x-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 overflow-x-auto">
          <button onClick={() => formatText('h1')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Heading 1">
            <Heading1 className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('h2')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Heading 2">
            <Heading2 className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('h3')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Heading 3">
            <Heading3 className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          
          <button onClick={() => formatText('bold')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Bold">
            <Bold className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('italic')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Italic">
            <Italic className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('underline')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Underline">
            <Underline className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          
          <button onClick={() => formatText('ul')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Bullet List">
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('ol')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Numbered List">
            <ListOrdered className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('quote')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Quote">
            <Quote className="h-4 w-4" />
          </button>
          <button onClick={() => formatText('code')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Code">
            <Code className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          
          <button onClick={() => formatText('link')} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Link">
            <Link className="h-4 w-4" />
          </button>
          <button onClick={insertImage} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Image">
            <Image className="h-4 w-4" />
          </button>
          <button onClick={insertVideo} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Video">
            <Video className="h-4 w-4" />
          </button>
          <button onClick={insertTable} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded" title="Table">
            <Table className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-6">
            <div
              className="prose prose-lg dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={renderPreview()}
            />
          </div>
        ) : (
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your document..."
            className="w-full h-full p-6 border-none outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm leading-relaxed"
          />
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {content.length} characters • {calculateReadTime(content)} min read
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last saved: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;