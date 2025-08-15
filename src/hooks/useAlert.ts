import { useAlert as useAlertContext } from '@/contexts/AlertContext';
import { AlertData } from '@/components/ui/Alert';

// Re-export the useAlert hook for convenience
export const useAlert = useAlertContext;

// Additional hooks for specific use cases
export const useAlertActions = () => {
  const { showSuccess, showWarning, showError, showInfo, showAlert, removeAlert, clearAllAlerts } = useAlert();

  // Enhanced methods with common patterns
  const handleSuccess = (message: string, details?: string) => {
    return showSuccess('สำเร็จ', `${message}${details ? `: ${details}` : ''}`, {
      duration: 4000
    });
  };

  const handleError = (message: string, details?: string) => {
    return showError('เกิดข้อผิดพลาด', `${message}${details ? `: ${details}` : ''}`, {
      duration: 8000
    });
  };

  const handleWarning = (message: string, details?: string) => {
    return showWarning('คำเตือน', `${message}${details ? `: ${details}` : ''}`, {
      duration: 6000
    });
  };

  const handleInfo = (message: string, details?: string) => {
    return showInfo('ข้อมูล', `${message}${details ? `: ${details}` : ''}`, {
      duration: 5000
    });
  };

  // API response handlers
  const handleApiSuccess = (action: string, details?: string) => {
    const messages = {
      save: 'บันทึกสำเร็จ',
      create: 'สร้างสำเร็จ',
      update: 'อัปเดตสำเร็จ',
      delete: 'ลบสำเร็จ',
      upload: 'อัปโหลดสำเร็จ',
      download: 'ดาวน์โหลดสำเร็จ',
      copy: 'คัดลอกสำเร็จ',
      send: 'ส่งสำเร็จ',
      sync: 'ซิงค์สำเร็จ',
      execute: 'ดำเนินการสำเร็จ',
    };
    
    const baseMessage = messages[action as keyof typeof messages] || `${action}สำเร็จ`;
    return showSuccess('สำเร็จ', details || baseMessage);
  };

  const handleApiError = (action: string, error?: string) => {
    const messages = {
      save: 'ไม่สามารถบันทึกได้',
      create: 'ไม่สามารถสร้างได้',
      update: 'ไม่สามารถอัปเดตได้',
      delete: 'ไม่สามารถลบได้',
      upload: 'ไม่สามารถอัปโหลดได้',
      download: 'ไม่สามารถดาวน์โหลดได้',
      copy: 'ไม่สามารถคัดลอกได้',
      send: 'ไม่สามารถส่งได้',
      sync: 'ไม่สามารถซิงค์ได้',
      execute: 'ไม่สามารถดำเนินการได้',
      network: 'ไม่สามารถเชื่อมต่อเครือข่ายได้',
      server: 'เซิร์ฟเวอร์ไม่ตอบสนอง',
      auth: 'การยืนยันตัวตนไม่ถูกต้อง',
      permission: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
      validation: 'ข้อมูลไม่ถูกต้อง',
      timeout: 'การเชื่อมต่อหมดเวลา'
    };
    
    const baseMessage = messages[action as keyof typeof messages] || `เกิดข้อผิดพลาดในการ${action}`;
    return showError('เกิดข้อผิดพลาด', `${baseMessage}${error ? `: ${error}` : ''}`);
  };

  // Confirmation alerts with actions
  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmLabel: string = 'ยืนยัน'
  ) => {
    return showWarning(title, message, {
      persistent: true,
      action: {
        label: confirmLabel,
        onClick: onConfirm
      }
    });
  };

  // Loading state alerts
  const showLoading = (message: string = 'กำลังดำเนินการ...') => {
    return showInfo('กำลังโหลด', message, {
      persistent: true,
      duration: 0
    });
  };

  return {
    // Basic alerts
    showSuccess,
    showWarning,
    showError,
    showInfo,
    showAlert,
    removeAlert,
    clearAllAlerts,

    // Enhanced Thai messages
    handleSuccess,
    handleError,
    handleWarning,
    handleInfo,

    // API handlers
    handleApiSuccess,
    handleApiError,

    // Special cases
    confirmAction,
    showLoading,

    // Utility
    alert: {
      success: handleSuccess,
      error: handleError,
      warning: handleWarning,
      info: handleInfo,
      apiSuccess: handleApiSuccess,
      apiError: handleApiError,
      confirm: confirmAction,
      loading: showLoading
    }
  };
};

export default useAlert;