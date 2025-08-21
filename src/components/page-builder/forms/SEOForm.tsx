import React from 'react';
import { Search, Tag, Globe } from 'lucide-react';

interface SEOFormProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  socialImage: string;
  onSeoTitleChange: (title: string) => void;
  onSeoDescriptionChange: (description: string) => void;
  onSeoKeywordsChange: (keywords: string[]) => void;
  onSocialImageChange: (image: string) => void;
}

const SEOForm: React.FC<SEOFormProps> = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  socialImage,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onSocialImageChange
}) => {
  const handleKeywordInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const newKeyword = input.value.trim();
      
      if (newKeyword && !seoKeywords.includes(newKeyword)) {
        onSeoKeywordsChange([...seoKeywords, newKeyword]);
        input.value = '';
      }
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    onSeoKeywordsChange(seoKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Search className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>
      </div>

      {/* SEO Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SEO Title
        </label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => onSeoTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="SEO optimized title (50-60 characters recommended)"
          maxLength={60}
        />
        <div className="mt-1 text-xs text-gray-500">
          {seoTitle.length}/60 characters
        </div>
      </div>

      {/* SEO Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          value={seoDescription}
          onChange={(e) => onSeoDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description for search engines (150-160 characters recommended)"
          maxLength={160}
        />
        <div className="mt-1 text-xs text-gray-500">
          {seoDescription.length}/160 characters
        </div>
      </div>

      {/* SEO Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Tag className="w-4 h-4" />
          SEO Keywords
        </label>
        <input
          type="text"
          onKeyDown={handleKeywordInput}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add SEO keywords (press Enter or comma to add)"
        />
        <div className="mt-1 text-xs text-gray-500">
          Add relevant keywords that describe your page content
        </div>

        {seoKeywords.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {seoKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md"
              >
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Social Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Social Sharing Image
        </label>
        <input
          type="url"
          value={socialImage}
          onChange={(e) => onSocialImageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
        <div className="mt-1 text-xs text-gray-500">
          Image shown when page is shared on social media (recommended: 1200x630px)
        </div>
        
        {socialImage && (
          <div className="mt-3">
            <img 
              src={socialImage} 
              alt="Social preview" 
              className="w-full max-w-sm h-32 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* SEO Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Search Preview</h4>
        <div className="bg-white p-3 rounded border">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
            {seoTitle || 'Page Title'}
          </div>
          <div className="text-green-700 text-sm">
            https://example.com/{seoTitle ? seoTitle.toLowerCase().replace(/\s+/g, '-') : 'page-url'}
          </div>
          <div className="text-gray-600 text-sm mt-1">
            {seoDescription || 'Page description will appear here...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOForm;