import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type TabId = 
  | 'dashboard'
  | 'notes'
  | 'tasks'
  | 'doubt-box'
  | 'lost-found'
  | 'profile'
  | 'settings'
  | 'admin';

export type AppRoute = 
  | 'landing'
  | 'auth'
  | TabId
  | 'not-found';

export interface RouteInfo {
  path: string;
  tab: TabId | 'landing' | 'auth' | 'not-found';
  title: string;
}

// Map tabs to canonical paths
export const TAB_TO_PATH: Record<TabId, string> = {
  'dashboard': '/homepage',
  'notes': '/notes',
  'tasks': '/tasks',
  'doubt-box': '/doubts',
  'lost-found': '/lost-found',
  'profile': '/profile',
  'settings': '/settings',
  'admin': '/admin'
};

// Route definitions and their page titles
const ROUTE_TITLES: Record<string, string> = {
  '/': 'Nexus | Campus Student Utility Platform',
  '/homepage': 'Nexus | Dashboard & Campus Feed',
  '/dashboard': 'Nexus | Dashboard & Campus Feed',
  '/home': 'Nexus | Dashboard & Campus Feed',
  '/notes': 'Nexus | Academic Notes Repository',
  '/tasks': 'Nexus | Student Commissions & Tasks',
  '/commissions': 'Nexus | Student Commissions & Tasks',
  '/doubts': 'Nexus | Peer Doubt Box',
  '/doubt-box': 'Nexus | Peer Doubt Box',
  '/lost-found': 'Nexus | Campus Lost & Found',
  '/lostandfound': 'Nexus | Campus Lost & Found',
  '/profile': 'Nexus | Student Academic Profile',
  '/settings': 'Nexus | Preferences & Device Session',
  '/admin': 'Nexus | Content Moderation Hub',
  '/login': 'Nexus | Student Sign In',
  '/signup': 'Nexus | Student Registration',
  '/auth': 'Nexus | Student Authentication'
};

export function resolveRoute(pathname: string, isAuthenticated: boolean): AppRoute {
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';

  if (cleanPath === '/' || cleanPath === '/welcome') {
    return isAuthenticated ? 'dashboard' : 'landing';
  }

  if (cleanPath === '/login' || cleanPath === '/signup' || cleanPath === '/auth') {
    return 'auth';
  }

  if (cleanPath === '/homepage' || cleanPath === '/dashboard' || cleanPath === '/home') {
    return 'dashboard';
  }

  if (cleanPath === '/notes') {
    return 'notes';
  }

  if (cleanPath === '/tasks' || cleanPath === '/commissions') {
    return 'tasks';
  }

  if (cleanPath === '/doubts' || cleanPath === '/doubt-box') {
    return 'doubt-box';
  }

  if (cleanPath === '/lost-found' || cleanPath === '/lostandfound') {
    return 'lost-found';
  }

  if (cleanPath === '/profile') {
    return 'profile';
  }

  if (cleanPath === '/settings') {
    return 'settings';
  }

  if (cleanPath === '/admin') {
    return 'admin';
  }

  return 'not-found';
}

interface RouterContextType {
  pathname: string;
  route: AppRoute;
  currentTab: TabId;
  navigate: (to: string, options?: { replace?: boolean; state?: any }) => void;
  navigateToTab: (tab: TabId) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

export interface RouterProviderProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

export function RouterProvider({ children, isAuthenticated }: RouterProviderProps) {
  const [pathname, setPathname] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const route = useMemo(() => {
    return resolveRoute(pathname, isAuthenticated);
  }, [pathname, isAuthenticated]);

  const currentTab: TabId = useMemo(() => {
    if (route === 'landing' || route === 'auth' || route === 'not-found') {
      return 'dashboard';
    }
    return route as TabId;
  }, [route]);

  // Navigate to any path
  const navigate = useCallback((to: string, options?: { replace?: boolean; state?: any }) => {
    const targetUrl = to.startsWith('/') ? to : '/' + to;
    if (options?.replace) {
      window.history.replaceState(options?.state || null, '', targetUrl);
    } else {
      window.history.pushState(options?.state || null, '', targetUrl);
    }
    setPathname(targetUrl);
  }, []);

  // Quick helper to navigate by tab identifier
  const navigateToTab = useCallback((tab: TabId) => {
    const targetPath = TAB_TO_PATH[tab] || '/homepage';
    navigate(targetPath);
  }, [navigate]);

  // Listen to browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update dynamic page title based on current path
  useEffect(() => {
    const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const dynamicTitle = ROUTE_TITLES[cleanPath] || 'Nexus | Student Platform';
    document.title = dynamicTitle;
  }, [pathname]);

  const contextValue = useMemo(() => ({
    pathname,
    route,
    currentTab,
    navigate,
    navigateToTab
  }), [pathname, route, currentTab, navigate, navigateToTab]);

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ to, replace = false, className, children, onClick, ...props }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Allow user to use Ctrl/Cmd+Click to open in new tab
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to, { replace });
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
};
