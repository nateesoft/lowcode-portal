import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "myProjects": "My Projects",
      "pages": "Pages",
      "services": "Services",
      "components": "Components",
      "settings": "Settings",
      "adminPanel": "Admin Panel",
      "users": "Users",
      "analytics": "Analytics",
      
      // Dashboard
      "welcomeBack": "Welcome back!",
      "whatsHappening": "Here's what's happening with your projects",
      "whatsHappeningMobile": "Here's what's happening",
      "totalProjects": "Total Projects",
      "published": "Published",
      "totalTasks": "Total Tasks",
      "completedTasks": "Completed Tasks",
      "recentProjects": "Recent Projects",
      "newProject": "New Project",
      "newProjectDemo": "New Project (Demo)",
      
      // Project Management
      "createProject": "Create Project",
      "newPage": "New Page",
      "newService": "New Service",
      "newComponent": "New Component",
      "inviteUser": "Invite User",
      "projectName": "Project Name",
      "type": "Type",
      "status": "Status",
      "progress": "Progress",
      "lastModified": "Last Modified",
      "actions": "Actions",
      "running": "Running",
      "stopped": "Stopped",
      "active": "Active",
      "inactive": "Inactive",
      "endpoints": "endpoints",
      "usage": "Used in {{count}} places",
      
      // Settings
      "accountSettings": "Account Settings",
      "fullName": "Full Name",
      "email": "Email",
      "company": "Company",
      "saveChanges": "Save Changes",
      "preferences": "Preferences",
      "darkMode": "Dark Mode",
      "darkModeDesc": "Switch between light and dark theme",
      "emailNotifications": "Email Notifications",
      "emailNotificationsDesc": "Receive email notifications for updates",
      
      // User Management
      "userManagement": "User Management",
      "user": "User",
      "role": "Role",
      "lastActive": "Last Active",
      
      // Analytics
      "totalUsers": "Total Users",
      "systemUptime": "System Uptime",
      "pageViews": "Page Views",
      "apiCalls": "API Calls",
      "recentActivity": "Recent Activity",
      
      // Create Project Modal
      "createNewProject": "Create New Project",
      "description": "Description",
      "describeProject": "Describe your project...",
      "projectType": "Project Type",
      "targetPlatform": "Target Platform",
      "fullStack": "Full-Stack",
      "fullStackDesc": "Complete web application",
      "singleWeb": "Single Web",
      "singleWebDesc": "Single page application",
      "microservice": "Microservice",
      "microserviceDesc": "API service",
      "scriptLogic": "Script Logic",
      "scriptLogicDesc": "Automation workflow",
      "web": "Web",
      "mobile": "Mobile",
      "iot": "IoT",
      "cancel": "Cancel",
      "createProject": "Create Project",
      
      // Common
      "upgradePlan": "Upgrade Plan",
      "plan": "Plan",
      "userTier": "{{tier}} Plan",
      "loading": "Loading...",
      "search": "Search...",
      "filter": "Filter",
      "sort": "Sort",
      "refresh": "Refresh",
      "delete": "Delete",
      "edit": "Edit",
      "view": "View",
      "save": "Save",
      "close": "Close",
      "open": "Open",
      "language": "Language",
      "currency": "Currency",
      "selectCurrency": "Select Currency",
      "features": "Features",
      "templates": "Templates",
      "pricing": "Pricing",
      "powerfulFeatures": "Powerful Features",
      "visualDevelopment": "Visual Development",
      "visualDevelopmentDesc": "Build applications with drag-and-drop components and visual workflows",
      "aiPowered": "AI-Powered",
      "aiPoweredDesc": "Leverage artificial intelligence to generate code and automate workflows",
      "productionReady": "Production Ready",
      "productionReadyDesc": "Deploy scalable applications with enterprise-grade security and performance"
    }
  },
  th: {
    translation: {
      // Navigation
      "dashboard": "แดชบอร์ด",
      "myProjects": "โปรเจคของฉัน",
      "pages": "หน้าเว็บ",
      "services": "บริการ",
      "components": "คอมโพเนนต์",
      "settings": "การตั้งค่า",
      "adminPanel": "แผงผู้ดูแล",
      "users": "ผู้ใช้",
      "analytics": "การวิเคราะห์",
      
      // Dashboard
      "welcomeBack": "ยินดีต้อนรับกลับ!",
      "whatsHappening": "นี่คือสิ่งที่เกิดขึ้นกับโปรเจคของคุณ",
      "whatsHappeningMobile": "นี่คือสิ่งที่เกิดขึ้น",
      "totalProjects": "โปรเจคทั้งหมด",
      "published": "เผยแพร่แล้ว",
      "totalTasks": "งานทั้งหมด",
      "completedTasks": "งานที่เสร็จแล้ว",
      "recentProjects": "โปรเจคล่าสุด",
      "newProject": "โปรเจคใหม่",
      "newProjectDemo": "โปรเจคใหม่ (ตัวอย่าง)",
      
      // Project Management
      "createProject": "สร้างโปรเจค",
      "newPage": "หน้าใหม่",
      "newService": "บริการใหม่",
      "newComponent": "คอมโพเนนต์ใหม่",
      "inviteUser": "เชิญผู้ใช้",
      "projectName": "ชื่อโปรเจค",
      "type": "ประเภท",
      "status": "สถานะ",
      "progress": "ความคืบหน้า",
      "lastModified": "แก้ไขล่าสุด",
      "actions": "การดำเนินการ",
      "running": "กำลังทำงาน",
      "stopped": "หยุดทำงาน",
      "active": "ใช้งาน",
      "inactive": "ไม่ใช้งาน",
      "endpoints": "จุดสิ้นสุด",
      "usage": "ใช้ใน {{count}} ที่",
      
      // Settings
      "accountSettings": "การตั้งค่าบัญชี",
      "fullName": "ชื่อเต็ม",
      "email": "อีเมล",
      "company": "บริษัท",
      "saveChanges": "บันทึกการเปลี่ยนแปลง",
      "preferences": "การตั้งค่า",
      "darkMode": "โหมดมืด",
      "darkModeDesc": "สลับระหว่างธีมสว่างและมืด",
      "emailNotifications": "การแจ้งเตือนทางอีเมล",
      "emailNotificationsDesc": "รับการแจ้งเตือนการอัปเดตทางอีเมล",
      
      // User Management
      "userManagement": "การจัดการผู้ใช้",
      "user": "ผู้ใช้",
      "role": "บทบาท",
      "lastActive": "ใช้งานล่าสุด",
      
      // Analytics
      "totalUsers": "ผู้ใช้ทั้งหมด",
      "systemUptime": "เวลาทำงานของระบบ",
      "pageViews": "การดูหน้า",
      "apiCalls": "การเรียก API",
      "recentActivity": "กิจกรรมล่าสุด",
      
      // Create Project Modal
      "createNewProject": "สร้างโปรเจคใหม่",
      "description": "คำอธิบาย",
      "describeProject": "อธิบายโปรเจคของคุณ...",
      "projectType": "ประเภทโปรเจค",
      "targetPlatform": "แพลตฟอร์มเป้าหมาย",
      "fullStack": "เต็มรูปแบบ",
      "fullStackDesc": "เว็บแอปพลิเคชันที่สมบูรณ์",
      "singleWeb": "เว็บเดียว",
      "singleWebDesc": "แอปพลิเคชันหน้าเดียว",
      "microservice": "ไมโครเซอร์วิส",
      "microserviceDesc": "บริการ API",
      "scriptLogic": "สคริปต์ลอจิก",
      "scriptLogicDesc": "เวิร์กโฟลว์อัตโนมัติ",
      "web": "เว็บ",
      "mobile": "มือถือ",
      "iot": "IoT",
      "cancel": "ยกเลิก",
      "createProject": "สร้างโปรเจค",
      
      // Common
      "upgradePlan": "อัปเกรดแผน",
      "plan": "แผน",
      "userTier": "แผน {{tier}}",
      "loading": "กำลังโหลด...",
      "search": "ค้นหา...",
      "filter": "กรอง",
      "sort": "เรียง",
      "refresh": "รีเฟรช",
      "delete": "ลบ",
      "edit": "แก้ไข",
      "view": "ดู",
      "save": "บันทึก",
      "close": "ปิด",
      "open": "เปิด",
      "language": "ภาษา",
      "currency": "สกุลเงิน",
      "selectCurrency": "เลือกสกุลเงิน",
      "features": "คุณสมบัติ",
      "templates": "เทมเพลต",
      "pricing": "แผนราคา",
      "powerfulFeatures": "คุณสมบัติที่ทรงพลัง",
      "visualDevelopment": "การพัฒนาแบบ Visual",
      "visualDevelopmentDesc": "สร้างแอปพลิเคชันด้วยการลากวางคอมโพเนนต์และเวิร์กโฟลว์แบบ visual",
      "aiPowered": "ขับเคลื่อนด้วย AI",
      "aiPoweredDesc": "ใช้ประโยชน์จากปัญญาประดิษฐ์ในการสร้างโค้ดและระบบอัตโนมัติ",
      "productionReady": "พร้อมใช้งานจริง",
      "productionReadyDesc": "ปรับใช้แอปพลิเคชันที่สามารถขยายขนาดได้พร้อมความปลอดภัยและประสิทธิภาพระดับองค์กร"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;