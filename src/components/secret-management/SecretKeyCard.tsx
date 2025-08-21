import React, { useState } from 'react';
import { Key, Edit, Trash2, Eye, EyeOff, Copy, Clock, Shield, Database } from 'lucide-react';
import { useAlert } from '@/hooks/useAlert';
import { useSecretManagement } from '@/contexts/SecretManagementContext';

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

interface SecretKeyCardProps {
  secret: SecretKey;
  onEdit: (secret: SecretKey) => void;
  onDelete: (id: string) => Promise<void>;
  onCopy: (value: string) => void;
  isDeleting?: boolean;
}

const SecretKeyCard: React.FC<SecretKeyCardProps> = ({
  secret,
  onEdit,
  onDelete,
  onCopy,
  isDeleting = false
}) => {
  const [isValueVisible, setIsValueVisible] = useState(false);
  const [isLocalDeleting, setIsLocalDeleting] = useState(false);
  const { showConfirm, showSuccess, showError } = useAlert();
  const { isVaultEnabled } = useSecretManagement();

  const handleCopy = async () => {
    try {
      await onCopy(secret.value);
      showSuccess('คัดลอกสำเร็จ', 'คัดลอกค่า Secret Key ไปยัง Clipboard แล้ว');
    } catch (error) {
      showError('ไม่สามารถคัดลอกได้', 'เกิดข้อผิดพลาดในการคัดลอก');
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      'ยืนยันการลบ Secret Key',
      `คุณแน่ใจหรือไม่ที่จะลบ "${secret.name}"? การดำเนินการนี้ไม่สามารถยกเลิกได้`,
      {
        confirmText: 'ลบ',
        cancelText: 'ยกเลิก',
        confirmType: 'danger'
      }
    );

    if (confirmed) {
      setIsLocalDeleting(true);
      try {
        await onDelete(secret.id);
        showSuccess('ลบสำเร็จ', `ลบ Secret Key "${secret.name}" เรียบร้อยแล้ว`);
      } catch (error) {
        console.error('Failed to delete secret:', error);
        showError('ไม่สามารถลบได้', 'เกิดข้อผิดพลาดในการลบ Secret Key');
      } finally {
        setIsLocalDeleting(false);
      }
    }
  };

  const getTypeIcon = (type: SecretKey['type']) => {
    switch (type) {
      case 'api_key': return <Key className="h-4 w-4" />;
      case 'password': return <Shield className="h-4 w-4" />;
      case 'certificate': return <Shield className="h-4 w-4" />;
      case 'token': return <Key className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: SecretKey['type']) => {
    switch (type) {
      case 'api_key': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'password': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'certificate': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      case 'token': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400';
    }
  };

  const maskValue = (value: string) => {
    if (!value) return '••••••••';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  const isExpired = secret.expiresAt && new Date(secret.expiresAt) < new Date();
  const isExpiringSoon = secret.expiresAt && 
    new Date(secret.expiresAt) > new Date() && 
    new Date(secret.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isExpired 
        ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10' 
        : isExpiringSoon 
        ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded ${getTypeColor(secret.type)}`}>
            {getTypeIcon(secret.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-slate-900 dark:text-white">{secret.name}</h3>
              {isVaultEnabled && (
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Vault
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{secret.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsValueVisible(!isValueVisible)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title={isValueVisible ? 'Hide value' : 'Show value'}
          >
            {isValueVisible ? (
              <EyeOff className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="Copy value"
          >
            <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={() => onEdit(secret)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="Edit secret"
          >
            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isLocalDeleting || isDeleting}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete secret"
          >
            {isLocalDeleting || isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
          Secret Value
        </label>
        <div className="flex items-center space-x-2">
          <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded font-mono text-sm">
            {isValueVisible ? secret.value : maskValue(secret.value)}
          </code>
        </div>
      </div>

      {secret.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {secret.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          <span>Created: {new Date(secret.createdAt).toLocaleDateString()}</span>
          <span>Modified: {new Date(secret.lastModified).toLocaleDateString()}</span>
        </div>
        {secret.expiresAt && (
          <div className={`flex items-center space-x-1 ${
            isExpired 
              ? 'text-red-600 dark:text-red-400' 
              : isExpiringSoon 
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            <Clock className="h-3 w-3" />
            <span>
              {isExpired ? 'Expired' : `Expires: ${new Date(secret.expiresAt).toLocaleDateString()}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretKeyCard;