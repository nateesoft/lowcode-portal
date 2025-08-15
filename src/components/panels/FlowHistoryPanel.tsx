import React, { useState, useEffect } from 'react';
import { History, Clock, User, RotateCcw, Trash2, Eye, Calendar, GitBranch, X } from 'lucide-react';
import { useAlertActions } from '@/hooks/useAlert';

interface FlowHistoryItem {
  id: number;
  version: string;
  name: string;
  description?: string;
  status: string;
  configuration: any;
  changeDescription?: string;
  changeType: 'manual' | 'auto' | 'import' | 'restore';
  metadata?: {
    nodeCount?: number;
    edgeCount?: number;
    rollbackFrom?: string;
  };
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface FlowHistoryPanelProps {
  flowId: string;
  currentVersion: string;
  onRestoreVersion: (version: string, historyData: FlowHistoryItem) => void;
  onClose: () => void;
}

const FlowHistoryPanel: React.FC<FlowHistoryPanelProps> = ({
  flowId,
  currentVersion,
  onRestoreVersion,
  onClose
}) => {
  const [history, setHistory] = useState<FlowHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<FlowHistoryItem | null>(null);
  const { alert } = useAlertActions();

  useEffect(() => {
    loadFlowHistory();
  }, [flowId]);

  const loadFlowHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/flows/${flowId}/history`);
      if (!response.ok) {
        throw new Error('Failed to load flow history');
      }
      const historyData = await response.json();
      setHistory(historyData);
    } catch (error: any) {
      console.error('Error loading flow history:', error);
      alert.error('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดประวัติ Flow ได้');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreVersion = async (historyItem: FlowHistoryItem) => {
    try {
      const response = await fetch(`http://localhost:8080/flows/${flowId}/restore/${historyItem.version}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1 // TODO: Get from auth context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      const restoredFlow = await response.json();
      alert.success('คืนค่าสำเร็จ', `คืนค่า Flow กลับไปที่เวอร์ชัน ${historyItem.version} สำเร็จ`);
      onRestoreVersion(historyItem.version, historyItem);
      onClose();
    } catch (error: any) {
      console.error('Error restoring version:', error);
      alert.error('เกิดข้อผิดพลาด', 'ไม่สามารถคืนค่าเวอร์ชันได้');
    }
  };

  const handleDeleteHistory = async (historyId: number) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประวัตินี้?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/flows/${flowId}/history/${historyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete history');
      }

      alert.success('ลบสำเร็จ', 'ลบประวัติสำเร็จ');
      loadFlowHistory(); // Reload history
    } catch (error: any) {
      console.error('Error deleting history:', error);
      alert.error('เกิดข้อผิดพลาด', 'ไม่สามารถลบประวัติได้');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'restore':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      case 'import':
        return <GitBranch className="h-4 w-4 text-purple-500" />;
      case 'auto':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-green-500" />;
    }
  };

  const getChangeTypeText = (changeType: string) => {
    switch (changeType) {
      case 'restore':
        return 'คืนค่า';
      case 'import':
        return 'นำเข้า';
      case 'auto':
        return 'อัตโนมัติ';
      default:
        return 'ด้วยตนเอง';
    }
  };

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              ประวัติ Flow
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          เวอร์ชันปัจจุบัน: {currentVersion}
        </p>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">ยังไม่มีประวัติ</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className={`p-3 border rounded-lg transition-all hover:shadow-md ${
                selectedHistory?.id === item.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {/* Version Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getChangeTypeIcon(item.changeType)}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    v{item.version}
                  </span>
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                    {getChangeTypeText(item.changeType)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedHistory(selectedHistory?.id === item.id ? null : item)}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    title="ดูรายละเอียด"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRestoreVersion(item)}
                    className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    title="คืนค่าเวอร์ชันนี้"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHistory(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="ลบประวัติ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Change Description */}
              {item.changeDescription && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {item.changeDescription}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-3">
                  {item.metadata?.nodeCount && (
                    <span>{item.metadata.nodeCount} nodes</span>
                  )}
                  {item.metadata?.edgeCount && (
                    <span>{item.metadata.edgeCount} edges</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedHistory?.id === item.id && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">ชื่อ Flow:</span>
                      <span className="ml-2 text-slate-600 dark:text-slate-400">{item.name}</span>
                    </div>
                    {item.description && (
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">คำอธิบาย:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">{item.description}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-slate-700 dark:text-slate-300">สถานะ:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {item.status === 'active' ? 'ใช้งาน' : 'ร่าง'}
                      </span>
                    </div>
                    {item.user && (
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">แก้ไขโดย:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">{item.user.username}</span>
                      </div>
                    )}
                    {item.metadata?.rollbackFrom && (
                      <div>
                        <span className="font-medium text-slate-700 dark:text-slate-300">คืนค่าจาก:</span>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">v{item.metadata.rollbackFrom}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          คลิก <RotateCcw className="h-3 w-3 inline" /> เพื่อคืนค่าเวอร์ชัน
        </p>
      </div>
    </div>
  );
};

export default FlowHistoryPanel;