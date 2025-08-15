/**
 * Global Alert Helpers - ใช้สำหรับ alert จากนอก React components
 * ตัวอย่างการใช้งาน: เรียกจาก utility functions, API handlers, etc.
 */

import { alert as globalAlert } from '@/contexts/AlertContext';

// API Response Handlers
export const apiHandlers = {
  success: (action: string, details?: string) => {
    const messages = {
      login: 'เข้าสู่ระบบสำเร็จ',
      logout: 'ออกจากระบบสำเร็จ',
      register: 'สมัครสมาชิกสำเร็จ',
      save: 'บันทึกข้อมูลสำเร็จ',
      update: 'อัปเดตข้อมูลสำเร็จ',
      delete: 'ลบข้อมูลสำเร็จ',
      create: 'สร้างข้อมูลสำเร็จ',
      upload: 'อัปโหลดไฟล์สำเร็จ',
      download: 'ดาวน์โหลดไฟล์สำเร็จ',
      copy: 'คัดลอกข้อมูลสำเร็จ',
      sync: 'ซิงค์ข้อมูลสำเร็จ',
      send: 'ส่งข้อมูลสำเร็จ',
      execute: 'ดำเนินการสำเร็จ',
      import: 'นำเข้าข้อมูลสำเร็จ',
      export: 'ส่งออกข้อมูลสำเร็จ',
      deploy: 'เผยแพร่สำเร็จ',
      backup: 'สำรองข้อมูลสำเร็จ',
      restore: 'กู้คืนข้อมูลสำเร็จ'
    };

    const message = messages[action as keyof typeof messages] || `${action}สำเร็จ`;
    return globalAlert.success('สำเร็จ', details || message);
  },

  error: (action: string, error?: string) => {
    const messages = {
      login: 'ไม่สามารถเข้าสู่ระบบได้',
      logout: 'ไม่สามารถออกจากระบบได้',
      register: 'ไม่สามารถสมัครสมาชิกได้',
      save: 'ไม่สามารถบันทึกข้อมูลได้',
      update: 'ไม่สามารถอัปเดตข้อมูลได้',
      delete: 'ไม่สามารถลบข้อมูลได้',
      create: 'ไม่สามารถสร้างข้อมูลได้',
      upload: 'ไม่สามารถอัปโหลดไฟล์ได้',
      download: 'ไม่สามารถดาวน์โหลดไฟล์ได้',
      copy: 'ไม่สามารถคัดลอกข้อมูลได้',
      sync: 'ไม่สามารถซิงค์ข้อมูลได้',
      send: 'ไม่สามารถส่งข้อมูลได้',
      execute: 'ไม่สามารถดำเนินการได้',
      import: 'ไม่สามารถนำเข้าข้อมูลได้',
      export: 'ไม่สามารถส่งออกข้อมูลได้',
      deploy: 'ไม่สามารถเผยแพร่ได้',
      backup: 'ไม่สามารถสำรองข้อมูลได้',
      restore: 'ไม่สามารถกู้คืนข้อมูลได้',
      network: 'ไม่สามารถเชื่อมต่อเครือข่ายได้',
      server: 'เซิร์ฟเวอร์ไม่ตอบสนอง',
      auth: 'การยืนยันตัวตนไม่ถูกต้อง',
      permission: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
      validation: 'ข้อมูลไม่ถูกต้อง',
      timeout: 'การเชื่อมต่อหมดเวลา',
      notfound: 'ไม่พบข้อมูลที่ต้องการ',
      conflict: 'ข้อมูลซ้ำซ้อน',
      ratelimit: 'การร้องขอเกินขีดจำกัด'
    };

    const message = messages[action as keyof typeof messages] || `เกิดข้อผิดพลาดในการ${action}`;
    return globalAlert.error('เกิดข้อผิดพลาด', `${message}${error ? `: ${error}` : ''}`);
  },

  warning: (action: string, details?: string) => {
    const messages = {
      validation: 'กรุณาตรวจสอบข้อมูลอีกครั้ง',
      permission: 'คุณมีสิทธิ์จำกัดในการดำเนินการนี้',
      quota: 'ใกล้หมดโควต้าการใช้งาน',
      maintenance: 'ระบบอยู่ในระหว่างการบำรุงรักษา',
      deprecated: 'ฟีเจอร์นี้จะถูกยกเลิกในอนาคต',
      beta: 'ฟีเจอร์นี้อยู่ในช่วงทดลอง',
      connection: 'การเชื่อมต่อไม่เสถียร',
      storage: 'พื้นที่จัดเก็บเหลือน้อย'
    };

    const message = messages[action as keyof typeof messages] || details || `คำเตือนเกี่ยวกับ${action}`;
    return globalAlert.warning('คำเตือน', message);
  },

  info: (action: string, details?: string) => {
    const messages = {
      loading: 'กำลังโหลดข้อมูล...',
      processing: 'กำลังประมวลผล...',
      saving: 'กำลังบันทึก...',
      uploading: 'กำลังอัปโหลด...',
      downloading: 'กำลังดาวน์โหลด...',
      syncing: 'กำลังซิงค์ข้อมูล...',
      deploying: 'กำลังเผยแพร่...',
      backing_up: 'กำลังสำรองข้อมูล...',
      restoring: 'กำลังกู้คืนข้อมูล...',
      update_available: 'มีอัปเดตใหม่',
      welcome: 'ยินดีต้อนรับสู่ระบบ',
      tip: 'เคล็ดลับ',
      feature: 'ฟีเจอร์ใหม่'
    };

    const message = messages[action as keyof typeof messages] || details || `ข้อมูลเกี่ยวกับ${action}`;
    return globalAlert.info('ข้อมูล', message);
  }
};

// Form Validation Helpers
export const validationAlerts = {
  required: (field: string) => globalAlert.warning('ข้อมูลไม่ครบถ้วน', `กรุณากรอก${field}`),
  
  invalid: (field: string, format: string) => 
    globalAlert.warning('ข้อมูลไม่ถูกต้อง', `${field}ไม่ถูกต้อง กรุณากรอกในรูปแบบ${format}`),
  
  tooShort: (field: string, min: number) =>
    globalAlert.warning('ข้อมูลสั้นเกินไป', `${field}ต้องมีอย่างน้อย ${min} ตัวอักษร`),
  
  tooLong: (field: string, max: number) =>
    globalAlert.warning('ข้อมูลยาวเกินไป', `${field}ต้องไม่เกิน ${max} ตัวอักษร`),
  
  duplicate: (field: string) =>
    globalAlert.warning('ข้อมูลซ้ำ', `${field}นี้มีอยู่ในระบบแล้ว`),
  
  mismatch: (field1: string, field2: string) =>
    globalAlert.warning('ข้อมูลไม่ตรงกัน', `${field1}และ${field2}ไม่ตรงกัน`)
};

// Connection Status Helpers
export const connectionAlerts = {
  online: () => globalAlert.success('เชื่อมต่อแล้ว', 'กลับมาออนไลน์แล้ว'),
  offline: () => globalAlert.warning('การเชื่อมต่อขาดหาย', 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต'),
  slow: () => globalAlert.info('การเชื่อมต่อช้า', 'การเชื่อมต่อของคุณค่อนข้างช้า'),
  reconnecting: () => globalAlert.info('กำลังเชื่อมต่อใหม่', 'กำลังพยายามเชื่อมต่อใหม่...')
};

// Shortcuts for common use cases
export const quickAlert = {
  // Success shortcuts
  saved: () => apiHandlers.success('save'),
  uploaded: () => apiHandlers.success('upload'),
  copied: () => apiHandlers.success('copy'),
  
  // Error shortcuts
  networkError: () => apiHandlers.error('network'),
  serverError: () => apiHandlers.error('server'),
  permissionDenied: () => apiHandlers.error('permission'),
  
  // Warning shortcuts
  unsavedChanges: () => globalAlert.warning('มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก', 'คุณต้องการออกโดยไม่บันทึกหรือไม่?'),
  confirmDelete: (onConfirm: () => void) => globalAlert.warning(
    'ยืนยันการลบ',
    'คุณแน่ใจหรือไม่ที่จะลบรายการนี้? การดำเนินการนี้ไม่สามารถยกเลิกได้',
    {
      persistent: true,
      action: {
        label: 'ลบเลย',
        onClick: onConfirm
      }
    }
  ),
  
  // Info shortcuts
  loading: () => apiHandlers.info('loading'),
  welcome: (username?: string) => 
    globalAlert.info('ยินดีต้อนรับ', `สวัสดี${username ? ` คุณ${username}` : ''}! ยินดีต้อนรับสู่ระบบ`)
};

// Export all helpers
export default {
  api: apiHandlers,
  validation: validationAlerts,
  connection: connectionAlerts,
  quick: quickAlert,
  global: globalAlert
};