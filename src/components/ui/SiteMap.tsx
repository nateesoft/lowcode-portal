import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Shield, 
  Code2, 
  Layers,
  Terminal,
  Globe,
  LogIn,
  ChevronRight
} from 'lucide-react';

interface RouteInfo {
  path: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'Public' | 'User' | 'Admin' | 'Development';
  requiresAuth?: boolean;
}

interface SiteMapProps {
  userRole?: 'admin' | 'user';
  isAuthenticated?: boolean;
  onClose?: () => void;
}

const SiteMap: React.FC<SiteMapProps> = ({ 
  userRole = 'user', 
  isAuthenticated = false, 
  onClose 
}) => {
  const router = useRouter();

  const routes: RouteInfo[] = [
    {
      path: '/landing',
      name: 'Landing Page',
      description: 'หน้าแรกแนะนำเว็บไซต์และคุณสมบัติต่างๆ',
      icon: <Globe className="h-5 w-5" />,
      category: 'Public'
    },
    {
      path: '/login', 
      name: 'Login',
      description: 'หน้าเข้าสู่ระบบสำหรับผู้ใช้',
      icon: <LogIn className="h-5 w-5" />,
      category: 'Public'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      description: 'หน้าหลักของผู้ใช้ แสดงโปรเจคและสถิติต่างๆ',
      icon: <Home className="h-5 w-5" />,
      category: 'User',
      requiresAuth: true
    },
    {
      path: '/builder',
      name: 'Project Builder', 
      description: 'เครื่องมือสร้างและแก้ไขโปรเจค Low-Code',
      icon: <Code2 className="h-5 w-5" />,
      category: 'Development',
      requiresAuth: true
    },
    {
      path: '/reactflow',
      name: 'React Flow',
      description: 'เครื่องมือสร้าง flowchart และ diagram',
      icon: <Layers className="h-5 w-5" />,
      category: 'Development', 
      requiresAuth: true
    },
    {
      path: '/admin',
      name: 'Admin Panel',
      description: 'หน้าจัดการระบบสำหรับผู้ดูแลระบบ',
      icon: <Shield className="h-5 w-5" />,
      category: 'Admin',
      requiresAuth: true
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose?.();
  };

  const filteredRoutes = routes.filter(route => {
    if (!isAuthenticated && route.requiresAuth) return false;
    if (route.category === 'Admin' && userRole !== 'admin') return false;
    return true;
  });

  const groupedRoutes = filteredRoutes.reduce((acc, route) => {
    const category = route.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(route);
    return acc;
  }, {} as Record<string, RouteInfo[]>);

  type CategoryType = 'Public' | 'User' | 'Development' | 'Admin';
  const categoryOrder: CategoryType[] = ['Public', 'User', 'Development', 'Admin'];
  const categoryColors: Record<CategoryType, string> = {
    'Public': 'text-green-600 dark:text-green-400',
    'User': 'text-blue-600 dark:text-blue-400', 
    'Development': 'text-purple-600 dark:text-purple-400',
    'Admin': 'text-red-600 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center">
          <Terminal className="h-6 w-6 mr-2 text-blue-600" />
          Site Map
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryRoutes = groupedRoutes[category];
          if (!categoryRoutes || categoryRoutes.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className={`text-sm font-semibold uppercase tracking-wide ${categoryColors[category as CategoryType]}`}>
                {category} Routes
              </h4>
              <div className="space-y-2">
                {categoryRoutes.map(route => (
                  <button
                    key={route.path}
                    onClick={() => handleNavigation(route.path)}
                    className="w-full text-left p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`${categoryColors[category as CategoryType]} mt-1 group-hover:scale-110 transition-transform`}>
                        {route.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {route.name}
                          </div>
                          <div className="flex items-center text-slate-400 group-hover:text-blue-500 transition-colors">
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded mr-2">
                              {route.path}
                            </code>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {route.description}
                        </p>
                        {route.requiresAuth && (
                          <div className="flex items-center mt-2">
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded">
                              🔒 ต้องเข้าสู่ระบบ
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <div className="font-medium mb-2">สถิติเส้นทาง:</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">ทั้งหมด:</span>
              <span className="ml-2 font-semibold text-slate-900 dark:text-white">{routes.length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500">เข้าถึงได้:</span> 
              <span className="ml-2 font-semibold text-green-600 dark:text-green-400">{filteredRoutes.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteMap;