import React, { useState } from 'react';
import { UserRole } from '@/lib/types';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useKeycloakSafe } from '@/hooks/useKeycloakSafe';
import { useKeycloakSync } from '@/hooks/useKeycloakSync';
import { useRouter } from 'next/navigation';
import { getDefaultRedirectForRole } from '@/lib/routes';
import KeycloakStatus from '@/components/debug/KeycloakStatus';

interface LoginPageProps {
  setIsAuthenticated: (authenticated: boolean) => void;
  setUserRole: (role: UserRole) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  setIsAuthenticated,
  setUserRole,
}) => {
  const { login, register, user } = useAuth();
  const keycloakAuth = useKeycloakSafe();
  const { isSyncing, syncError, isKeycloakAuthenticated, isLocalAuthenticated } = useKeycloakSync();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('Form submission started:', { isLogin, formData: { ...formData, password: '***' } });

    try {
      if (isLogin) {
        console.log('Attempting login...');
        // Use AuthContext login which handles both API call and state management
        await login(formData.email, formData.password);
        console.log('Login successful');
        // Set legacy state for any components that still depend on it
        setIsAuthenticated(true);
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        if (!formData.firstName || !formData.lastName) {
          console.log('Registration validation failed: missing fields');
          setError('Please fill in all fields');
          setLoading(false);
          return;
        }
        console.log('Attempting registration...');
        // Use AuthContext register which handles both API call and state management
        await register(formData.email, formData.password, formData.firstName, formData.lastName);
        console.log('Registration successful');
        // Set legacy state for any components that still depend on it
        setIsAuthenticated(true);
        setUserRole('user'); // Default role for new users
        // Redirect to dashboard
        router.push('/dashboard');
      }
      
    } catch (err: any) {
      console.error('Login/Register error:', err);
      console.error('Error details:', { 
        message: err.message, 
        response: err.response?.data, 
        status: err.response?.status 
      });
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/landing')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-2"
            title="Back to Home"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-16 w-auto object-contain"
          />
          <div className="w-10"></div>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1 mb-8">
          <button
            onClick={() => handleModeChange(true)}
            className={`flex-1 py-2 rounded-md transition ${isLogin ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => handleModeChange(false)}
            className={`flex-1 py-2 rounded-md transition ${!isLogin ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {syncError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
              Keycloak Sync Error: {syncError}
            </div>
          )}

          {isSyncing && (
            <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Syncing Keycloak user data...
            </div>
          )}

          {isKeycloakAuthenticated && isLocalAuthenticated && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg text-sm">
              ✅ Successfully authenticated with Keycloak and synced to local database
            </div>
          )}

          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required={!isLogin}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  required={!isLogin}
                />
              </div>
            </>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-slate-500 dark:text-slate-400">or continue with</span>
        </div>

        <div className="space-y-2">
          <button 
            onClick={() => keycloakAuth.loginWithGoogle()}
            disabled={!keycloakAuth.isKeycloakReady}
            className="w-full py-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => keycloakAuth.login()}
            disabled={!keycloakAuth.isKeycloakReady}
            className="w-full py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Login with Keycloak
          </button>
        </div>
      </div>
      <KeycloakStatus />
    </div>
  );
};

export default LoginPage;