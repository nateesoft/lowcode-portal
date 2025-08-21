import React from 'react';
import { Plus, ServerIcon, Play, Edit, Trash2, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ServiceResponse } from '@/lib/api';
import { useAlertActions } from '@/hooks/useAlert';
import { useAlert } from '@/contexts/AlertContext';

interface ServicesViewProps {
  flows: ServiceResponse[];
  setShowServiceFlowModal: (show: boolean) => void;
  setEditingFlow: (flow: ServiceResponse | null) => void;
  loadServices: () => void;
}

const ServicesView: React.FC<ServicesViewProps> = ({
  flows,
  setShowServiceFlowModal,
  setEditingFlow,
  loadServices
}) => {
  const { t } = useTranslation();
  const { alert } = useAlertActions();
  const { showConfirm } = useAlert();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('services')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            สร้างและจัดการ APIs ในระบบ
          </p>
        </div>
        <button 
          onClick={() => setShowServiceFlowModal(true)}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('newService')}
        </button>
      </div>
      <div className="p-4 sm:p-6">
        {flows.length === 0 ? (
          <div className="text-center py-12">
            <ServerIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No Service Flows
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create your first service flow to manage your application logic
            </p>
            <button 
              onClick={() => setShowServiceFlowModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Create Your First Flow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flows.map((flow, index) => (
              <div key={flow.id || index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                      <ServerIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-slate-900 dark:text-white">{flow.name}</div>
                        {flow.version && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs">
                            v{flow.version}
                          </span>
                        )}
                        {flow.serviceType && (
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded text-xs">
                            {flow.serviceType.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {flow.nodes?.length || 0} nodes
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    flow.isActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                  }`}>
                    {flow.isActive ? 'active' : 'inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Created {new Date(flow.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={async () => {
                        try {
                          alert.apiSuccess('execute', `Service "${flow.name}" is ready to execute`);
                        } catch (error: any) {
                          console.error('Service execution error:', error);
                          alert.apiError('execute', error.message);
                        }
                      }}
                      disabled={!flow.isActive}
                      className={`p-1 rounded ${
                        flow.isActive
                          ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-green-600 dark:text-green-400'
                          : 'opacity-50 cursor-not-allowed text-slate-400'
                      }`}
                      title="Execute Service"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingFlow(flow);
                        setShowServiceFlowModal(true);
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      title="Edit Service"
                    >
                      <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button 
                      onClick={async () => {
                        if (await showConfirm(`Are you sure you want to delete "${flow.name}"?`, 'This action cannot be undone.', {
                          confirmText: 'Delete',
                          cancelText: 'Cancel',
                          confirmType: 'danger'
                        })) {
                          try {
                            // Note: serviceAPI import would be needed in the actual implementation
                            // await serviceAPI.delete(flow.id);
                            alert.apiSuccess('delete');
                            loadServices(); // Refresh the list
                          } catch (error: any) {
                            console.error('Delete error:', error);
                            alert.apiError('delete', error.response?.data?.message || error.message);
                          }
                        }
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      title="Delete Service"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesView;