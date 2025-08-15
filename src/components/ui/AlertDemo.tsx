import React from 'react';
import { useAlertActions } from '@/hooks/useAlert';

const AlertDemo: React.FC = () => {
  const { alert } = useAlertActions();

  return (
    <div className="p-6 space-y-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        ทดสอบระบบ Alert
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Success Alerts */}
        <div className="space-y-2">
          <h4 className="font-medium text-green-600 dark:text-green-400">Success Alerts</h4>
          <button
            onClick={() => alert.success('การบันทึกสำเร็จ')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Basic Success
          </button>
          <button
            onClick={() => alert.apiSuccess('save', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว')}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            API Success
          </button>
        </div>

        {/* Warning Alerts */}
        <div className="space-y-2">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400">Warning Alerts</h4>
          <button
            onClick={() => alert.warning('คำเตือน', 'กรุณาตรวจสอบข้อมูลอีกครั้ง')}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Basic Warning
          </button>
          <button
            onClick={() => alert.confirm(
              'ยืนยันการลบ',
              'คุณแน่ใจหรือไม่ที่จะลบรายการนี้?',
              () => alert.success('ลบสำเร็จ'),
              'ลบเลย'
            )}
            className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Confirmation
          </button>
        </div>

        {/* Error Alerts */}
        <div className="space-y-2">
          <h4 className="font-medium text-red-600 dark:text-red-400">Error Alerts</h4>
          <button
            onClick={() => alert.error('เกิดข้อผิดพลาด')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Basic Error
          </button>
          <button
            onClick={() => alert.apiError('network', 'Connection timeout')}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Network Error
          </button>
        </div>

        {/* Info Alerts */}
        <div className="space-y-2">
          <h4 className="font-medium text-blue-600 dark:text-blue-400">Info Alerts</h4>
          <button
            onClick={() => alert.info('ข้อมูล', 'รายการใหม่ที่เพิ่มเข้ามา')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Basic Info
          </button>
          <button
            onClick={() => {
              const loadingId = alert.loading('กำลังประมวลผล...');
              setTimeout(() => {
                // Remove loading and show success
                alert.apiSuccess('execute', 'ประมวลผลเสร็จสิ้น');
              }, 3000);
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Loading Demo
          </button>
        </div>
      </div>

      {/* Advanced Demo */}
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <h4 className="font-medium text-slate-900 dark:text-white mb-3">Advanced Features</h4>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              // Multiple alerts
              alert.info('เริ่มต้นการดำเนินงาน');
              setTimeout(() => alert.warning('กำลังประมวลผล...'), 500);
              setTimeout(() => alert.success('เสร็จสิ้น!'), 1500);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Multiple Alerts
          </button>
          
          <button
            onClick={() => {
              alert.success('Persistent Alert', 'Alert นี้จะไม่หายไปเอง', {
                persistent: true,
                action: {
                  label: 'รับทราบ',
                  onClick: () => console.log('Action clicked!')
                }
              });
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Persistent with Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertDemo;