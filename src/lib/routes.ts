// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/login', // Login page itself should be accessible
];

// Routes that should redirect to dashboard if user is already logged in
export const AUTH_ROUTES = [
  '/login',
];

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/flows',
  '/components',
  '/pages',
  '/my-projects',
  '/notes',
  '/profile',
  '/settings',
];

// Admin-only routes that require admin role
export const ADMIN_ROUTES = [
  '/admin',
];

// Default redirect routes
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
export const DEFAULT_LOGOUT_REDIRECT = '/landing';

/**
 * Get the appropriate default redirect based on user role
 */
export function getDefaultRedirectForRole(userRole?: string): string {
  return userRole === 'admin' ? '/admin' : '/dashboard';
}

/**
 * Check if a route is public (accessible without authentication)
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Check if a route is an authentication route (login/register)
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a route is protected (requires authentication)
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a route requires admin role
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Get the appropriate redirect URL based on authentication status and role
 */
export function getRedirectUrl(pathname: string, isAuthenticated: boolean, userRole?: string): string | null {
  console.log(`Route check: ${pathname}, authenticated: ${isAuthenticated}, role: ${userRole}`);
  console.log(`Is public: ${isPublicRoute(pathname)}, Is auth: ${isAuthRoute(pathname)}, Is protected: ${isProtectedRoute(pathname)}, Is admin: ${isAdminRoute(pathname)}`);
  
  // If user is authenticated and trying to access auth routes
  if (isAuthenticated && isAuthRoute(pathname)) {
    const roleBasedRedirect = getDefaultRedirectForRole(userRole);
    console.log(`Redirecting authenticated user from auth route ${pathname} to ${roleBasedRedirect}`);
    return roleBasedRedirect;
  }
  
  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && isProtectedRoute(pathname)) {
    console.log(`Redirecting unauthenticated user from protected route ${pathname} to ${DEFAULT_LOGOUT_REDIRECT}`);
    return DEFAULT_LOGOUT_REDIRECT;
  }
  
  // If user is not authenticated and trying to access admin routes
  if (!isAuthenticated && isAdminRoute(pathname)) {
    console.log(`Redirecting unauthenticated user from admin route ${pathname} to ${DEFAULT_LOGOUT_REDIRECT}`);
    return DEFAULT_LOGOUT_REDIRECT;
  }
  
  // If user is authenticated but not admin and trying to access admin routes
  if (isAuthenticated && isAdminRoute(pathname) && userRole !== 'admin') {
    const roleBasedRedirect = getDefaultRedirectForRole(userRole);
    console.log(`Redirecting non-admin user from admin route ${pathname} to ${roleBasedRedirect}`);
    return roleBasedRedirect;
  }
  
  // If user is not authenticated and trying to access non-public routes
  if (!isAuthenticated && !isPublicRoute(pathname)) {
    console.log(`Redirecting unauthenticated user from non-public route ${pathname} to ${DEFAULT_LOGOUT_REDIRECT}`);
    return DEFAULT_LOGOUT_REDIRECT;
  }
  
  console.log(`No redirect needed for ${pathname}`);
  return null;
}