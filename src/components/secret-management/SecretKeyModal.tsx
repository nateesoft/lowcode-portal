import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Calendar, Tag, Plus, Maximize2, Minimize2, Move } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';
import { useAlert } from '@/hooks/useAlert';

interface SecretKey {
  id: string;
  name: string;
  description: string;
  value: string;
  createdAt: string;
  lastModified: string;
  expiresAt?: string;
  tags: string[];
  type: 'api_key' | 'password' | 'certificate' | 'token';
}

interface SecretKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (secret: Omit<SecretKey, 'id' | 'createdAt' | 'lastModified'>) => Promise<void>;
  editingSecret?: SecretKey | null;
}

const SecretKeyModal: React.FC<SecretKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSecret
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: '',
    type: 'api_key' as SecretKey['type'],
    expiresAt: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { 
    dragRef, 
    modalRef, 
    isDragging, 
    isResizing,
    isFullscreen, 
    modalStyle, 
    dragHandleStyle, 
    resizeHandles,
    handleMouseDown, 
    handleResizeMouseDown,
    toggleFullscreen, 
    resetPosition 
  } = useModalDragAndResize();

  useEffect(() => {
    if (editingSecret) {
      setFormData({
        name: editingSecret.name,
        description: editingSecret.description,
        value: editingSecret.value,
        type: editingSecret.type,
        expiresAt: editingSecret.expiresAt ? editingSecret.expiresAt.split('T')[0] : '',
        tags: editingSecret.tags
      });
    } else {
      setFormData({
        name: '',
        description: '',
        value: '',
        type: 'api_key',
        expiresAt: '',
        tags: []
      });
    }
  }, [editingSecret, isOpen]);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useAlert();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.value.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined
      });
      showSuccess(
        editingSecret ? 'อัปเดตสำเร็จ' : 'สร้างสำเร็จ',
        `${editingSecret ? 'อัปเดต' : 'สร้าง'} Secret Key "${formData.name}" เรียบร้อยแล้ว`
      );
      onClose();
    } catch (error) {
      console.error('Failed to save secret:', error);
      showError(
        editingSecret ? 'ไม่สามารถอัปเดตได้' : 'ไม่สามารถสร้างได้',
        'เกิดข้อผิดพลาดในการบันทึก Secret Key'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateRandomValue = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, value: result }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        style={modalStyle}
      >
        {/* Resize Handles */}
        {!isFullscreen && resizeHandles.map((handle) => (
          <div
            key={handle.direction}
            style={handle.style}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
            className="hover:bg-blue-500 hover:opacity-50 transition-colors"
          />
        ))}
        <div 
          ref={dragRef}
          className="p-6 border-b border-slate-200 dark:border-slate-700"
          style={dragHandleStyle}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {editingSecret ? 'Edit Secret' : 'Create Secret'}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <div className="flex items-center text-slate-400 px-2">
                <Move className="h-4 w-4" />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Secret Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="My API Key"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SecretKey['type'] }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="api_key">API Key</option>
                <option value="password">Password</option>
                <option value="certificate">Certificate</option>
                <option value="token">Token</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              placeholder="Description of this secret..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Secret Value *
              </label>
              <button
                type="button"
                onClick={generateRandomValue}
                className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
              >
                Generate Random
              </button>
            </div>
            <div className="relative">
              <textarea
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white font-mono"
                placeholder="Enter secret value..."
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
              >
                {showPassword ? <Shield className="h-4 w-4" /> : <Key className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Expiration Date (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-lg"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              {isSubmitting 
                ? (editingSecret ? 'Updating...' : 'Creating...')
                : (editingSecret ? 'Update Secret' : 'Create Secret')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecretKeyModal;