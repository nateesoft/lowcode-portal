'use client'

import React, { useState } from 'react';
import { Code2, Layers, Package, Users, Plus, Eye, 
    Globe, Smartphone, Cpu, LogOut, Bell, Moon, Sun, Home, Zap, 
    Check, Edit, Trash2, TrendingUp, Activity, Terminal, Lock,
    Shield, Star, Award, Menu, X, BarChart3 } from 'lucide-react';

const HomePortal = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [userTier, setUserTier] = useState('Junior');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminView, setAdminView] = useState('overview');

  // Sample data
  const [projects, setProjects] = useState([
    { id: 1, name: 'E-commerce Platform', type: 'Full-Stack', status: 'Published', lastModified: '2025-01-10', tasks: 12, completed: 8 },
    { id: 2, name: 'Dashboard Analytics', type: 'Single Web', status: 'Draft', lastModified: '2025-01-09', tasks: 5, completed: 2 },
    { id: 3, name: 'Payment Service', type: 'Microservice', status: 'Draft', lastModified: '2025-01-08', tasks: 8, completed: 8 },
  ]);

  const templates = [
    { id: 1, name: 'E-commerce Starter', category: 'Full-Stack', description: 'Complete online store with cart, checkout, and admin panel', stars: 4.8, uses: 1250, icon: '🛍️' },
    { id: 2, name: 'Admin Dashboard', category: 'Single Web', description: 'Modern analytics dashboard with charts and widgets', stars: 4.7, uses: 890, icon: '📊' },
    { id: 3, name: 'API Gateway', category: 'Microservice', description: 'Scalable API gateway with authentication and rate limiting', stars: 4.9, uses: 567, icon: '🔌' },
    { id: 4, name: 'Blog Platform', category: 'Full-Stack', description: 'Content management system with editor and comments', stars: 4.6, uses: 2100, icon: '📝' },
    { id: 5, name: 'Data Pipeline', category: 'Script Logic', description: 'ETL pipeline for data processing and transformation', stars: 4.5, uses: 345, icon: '⚡' },
    { id: 6, name: 'Real-time Chat', category: 'Full-Stack', description: 'WebSocket-based chat application with rooms', stars: 4.8, uses: 780, icon: '💬' },
  ];

  const tierLimits = {
    Junior: { projects: 1, exports: 3, nodes: 20, support: 'Community' },
    Senior: { projects: 5, exports: 20, nodes: 100, support: 'Email' },
    Specialist: { projects: '∞', exports: '∞', nodes: '∞', support: 'Priority' },
  };

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowCode</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition">Features</button>
              <button className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition">Templates</button>
              <button className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition">Pricing</button>
              <button 
                onClick={() => setCurrentPage('login')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-4">
              <div className="flex flex-col space-y-4 px-4">
                <button className="text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2">Features</button>
                <button className="text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2">Templates</button>
                <button className="text-left text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition py-2">Pricing</button>
                <button 
                  onClick={() => { setCurrentPage('login'); setMobileMenuOpen(false); }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition text-center mt-4"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Build Apps <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10x Faster</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto px-4">
            The AI-powered low-code platform that transforms your ideas into production-ready applications with visual workflows and intelligent automation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <button 
              onClick={() => setCurrentPage('login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
            >
              Start Building Free
            </button>
            <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-lg font-semibold border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Start with Production-Ready Templates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 hover:shadow-xl transition transform hover:scale-105 cursor-pointer">
                <div className="text-4xl mb-4">{template.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{template.name}</h3>
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-sm mb-3">
                  {template.category}
                </span>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{template.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{template.stars}</span>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-500">{template.uses} uses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {['Junior', 'Senior', 'Specialist'].map((tier, index) => (
              <div key={tier} className={`bg-white dark:bg-slate-800 rounded-xl p-8 ${index === 1 ? 'ring-2 ring-blue-600 transform scale-105' : ''}`}>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{tier}</h3>
                <div className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
                  {tier === 'Junior' ? 'Free' : tier === 'Senior' ? '$10/mo' : '$100/mo'}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {tierLimits[tier].projects} {tier === 'Specialist' ? 'Unlimited' : ''} Projects
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {tierLimits[tier].exports} Exports/month
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {tierLimits[tier].nodes} Nodes per flow
                  </li>
                  <li className="flex items-center text-slate-600 dark:text-slate-300">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    {tierLimits[tier].support} Support
                  </li>
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition ${
                  index === 1 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}>
                  {tier === 'Junior' ? 'Start Free' : 'Upgrade Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  // Login Page Component  
  const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="flex items-center justify-center mb-8">
            <Code2 className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowCode</span>
          </div>
          
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md transition ${isLogin ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md transition ${!isLogin ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
            >
              Sign Up
            </button>
          </div>

          <div>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" />
            </div>

            <button 
              onClick={() => { setIsAuthenticated(true); setCurrentPage('dashboard'); }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-slate-500 dark:text-slate-400">or continue with</span>
          </div>

          <button className="w-full mt-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <div className="mt-4 text-center">
            <button 
              onClick={() => { setIsAuthenticated(true); setUserRole('admin'); setCurrentPage('dashboard'); }}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              Login as Admin (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard Component
  const Dashboard = () => {
    const stats = {
      totalProjects: projects.length,
      published: projects.filter(p => p.status === 'Published').length,
      totalTasks: projects.reduce((acc, p) => acc + p.tasks, 0),
      completedTasks: projects.reduce((acc, p) => acc + p.completed, 0),
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowCode</span>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            <button 
              onClick={() => setCurrentPage('projects')}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              <Layers className="h-5 w-5" />
              <span>My Projects</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
              <Package className="h-5 w-5" />
              <span>Templates</span>
            </button>
            {userRole === 'admin' && (
              <>
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="px-4 text-xs font-semibold text-slate-400 uppercase">Admin</span>
                </div>
                <button 
                  onClick={() => setCurrentPage('admin')}
                  className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                >
                  <Shield className="h-5 w-5" />
                  <span>Admin Panel</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                  <Users className="h-5 w-5" />
                  <span>Users</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                  <Activity className="h-5 w-5" />
                  <span>Analytics</span>
                </button>
              </>
            )}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">User Name</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                    <Award className="h-3 w-3 mr-1" />
                    {userTier} Plan
                  </div>
                </div>
              </div>
              <button 
                onClick={() => { setIsAuthenticated(false); setCurrentPage('landing'); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
            <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition">
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:ml-64">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowCode</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-8">
            {/* Header - Desktop only */}
            <div className="hidden lg:flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening with your projects</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <Bell className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            {/* Mobile Header */}
            <div className="lg:hidden mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    12%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Projects</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    8%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.published}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Published</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    24%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTasks}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedTasks}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Completed Tasks</div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {/* Mobile Cards View */}
                <div className="lg:hidden space-y-4">
                  {projects.map(project => (
                    <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                            {project.type}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${
                          project.status === 'Published' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Progress:</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {project.completed}/{project.tasks}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                            style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{project.lastModified}</span>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => { setSelectedProject(project); setCurrentPage('builder'); }}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                          >
                            <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                        <th className="pb-4">Project Name</th>
                        <th className="pb-4">Type</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Progress</th>
                        <th className="pb-4">Last Modified</th>
                        <th className="pb-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      {projects.map(project => (
                        <tr key={project.id} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="py-4">
                            <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                              {project.type}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-sm ${
                              project.status === 'Published' 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                  style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {project.completed}/{project.tasks}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                            {project.lastModified}
                          </td>
                          <td className="py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => { setSelectedProject(project); setCurrentPage('builder'); }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                              >
                                <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              </button>
                              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              </button>
                              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New Project</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" placeholder="My Awesome App" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" rows="3" placeholder="Describe your project..."></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Full-Stack', 'Single Web', 'Microservice', 'Script Logic'].map(type => (
                      <button key={type} className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition text-left">
                        <div className="font-medium text-slate-900 dark:text-white">{type}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {type === 'Full-Stack' && 'Complete web application'}
                          {type === 'Single Web' && 'Single page application'}
                          {type === 'Microservice' && 'API service'}
                          {type === 'Script Logic' && 'Automation workflow'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Platform</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                      <Globe className="h-5 w-5 mr-2" />
                      Web
                    </button>
                    <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                      <Smartphone className="h-5 w-5 mr-2" />
                      Mobile
                    </button>
                    <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                      <Cpu className="h-5 w-5 mr-2" />
                      IoT
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { setShowCreateModal(false); setCurrentPage('builder'); }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Admin Panel Component
  const AdminPanel = () => {
    const stats = {
      totalUsers: 1234,
      totalProjects: 5678,
      totalExports: 890,
      activeUsers: 456,
      juniorUsers: 800,
      seniorUsers: 350,
      specialistUsers: 84,
    };

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Admin Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Admin Panel</span>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            <button 
              onClick={() => setAdminView('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                adminView === 'overview' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </button>
            <button 
              onClick={() => setAdminView('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
                adminView === 'users' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
              <Package className="h-5 w-5" />
              <span>Templates</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
              <Activity className="h-5 w-5" />
              <span>Analytics</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
              <Terminal className="h-5 w-5" />
              <span>Logs</span>
            </button>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Main Admin Content */}
        <div className="lg:ml-64">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-600" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">Admin</span>
            </div>
            <div className="w-8"></div>
          </div>
          
          <div className="p-4 sm:p-8">
            {adminView === 'overview' && (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">Admin Overview</h1>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="h-8 w-8 text-blue-600" />
                      <span className="text-sm text-green-600 dark:text-green-400">+12%</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <Layers className="h-8 w-8 text-purple-600" />
                      <span className="text-sm text-green-600 dark:text-green-400">+8%</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Projects</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <Eye className="h-8 w-8 text-green-600" />
                      <span className="text-sm text-green-600 dark:text-green-400">+24%</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalExports}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Total Exports</div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <Activity className="h-8 w-8 text-orange-600" />
                      <span className="text-sm text-green-600 dark:text-green-400">+5%</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeUsers}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
                  </div>
                </div>

                {/* User Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">User Distribution by Tier</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Junior (Free)</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{stats.juniorUsers} users</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div className="bg-blue-600 h-3 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Senior ($10/mo)</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{stats.seniorUsers} users</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div className="bg-purple-600 h-3 rounded-full" style={{ width: '28%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialist ($100/mo)</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{stats.specialistUsers} users</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full" style={{ width: '7%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {adminView === 'users' && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                  <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                    + Add User
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="flex-1">
                        <input 
                          type="text" 
                          placeholder="Search users..." 
                          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="flex space-x-4">
                        <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                          <option>All Tiers</option>
                          <option>Junior</option>
                          <option>Senior</option>
                          <option>Specialist</option>
                        </select>
                        <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                          <option>All Status</option>
                          <option>Active</option>
                          <option>Suspended</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                            <th className="pb-4">User</th>
                            <th className="pb-4">Email</th>
                            <th className="pb-4">Tier</th>
                            <th className="pb-4">Projects</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Joined</th>
                            <th className="pb-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                              <td className="py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    U{i}
                                  </div>
                                  <span className="font-medium text-slate-900 dark:text-white">User {i}</span>
                                </div>
                              </td>
                              <td className="py-4 text-sm text-slate-600 dark:text-slate-400">user{i}@example.com</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  i === 1 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                  i === 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                  'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {i === 1 ? 'Specialist' : i === 2 ? 'Senior' : 'Junior'}
                                </span>
                              </td>
                              <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{Math.floor(Math.random() * 10)}</td>
                              <td className="py-4">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm">
                                  Active
                                </span>
                              </td>
                              <td className="py-4 text-sm text-slate-600 dark:text-slate-400">2025-01-0{i}</td>
                              <td className="py-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                  </button>
                                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                  </button>
                                  <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Role-based routing
  const renderPage = () => {
    if (!isAuthenticated && currentPage !== 'landing' && currentPage !== 'login') {
      return <LoginPage />;
    }

    switch(currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'dashboard':
      case 'projects':
        return <Dashboard />;
      case 'admin':
        return userRole === 'admin' ? <AdminPanel /> : <Dashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {renderPage()}
    </div>
  );
};

export default HomePortal;