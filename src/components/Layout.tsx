import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  HelpCircle, 
  Compass, 
  User,
  Menu,
  Settings as SettingsIcon
} from 'lucide-react';
import { StudentProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  profile: StudentProfile;
}

export default function Layout({
  children,
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
  profile
}: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'tasks', label: 'Tasks', icon: Briefcase },
    { id: 'doubt-box', label: 'Doubt Box', icon: HelpCircle },
    { id: 'lost-found', label: 'Lost & Found', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
  };

  return (
    <div id="nexus-app-root" className="min-h-screen flex text-text-primary bg-app transition-colors duration-150 font-sans">
      {/* Sidebar - Desktop locked to left */}
      <aside 
        id="desktop-sidebar"
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-30 bg-surface border-r border-border-subtle transition-all duration-300 ${
          isCollapsed ? 'md:w-16' : 'md:w-64'
        }`}
      >
        <button
          id="sidebar-logo-btn"
          onClick={() => setCurrentTab('profile')}
          className={`h-16 border-b border-border-subtle flex items-center gap-2 text-left hover:bg-bg-hover/50 transition-colors cursor-pointer w-full ${
            isCollapsed ? 'justify-center px-0' : 'px-6'
          }`}
          title="Go to Profile"
        >
          <div className="w-8 h-8 rounded-lg bg-accent-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
            N
          </div>
          {!isCollapsed && (
            <>
              <span className="font-bold text-lg tracking-wider text-text-primary">NEXUS</span>
              <span className="text-[10px] bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary px-1.5 py-0.5 rounded-full font-medium ml-1">
                v1.0
              </span>
            </>
          )}
        </button>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`desktop-nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary border-l-4 border-accent-primary' 
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                title={item.label}
              >
                <IconComponent size={18} className={isActive ? 'text-accent-primary' : 'text-text-secondary'} />
                {!isCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className={`flex items-center gap-3 py-2 rounded-lg bg-bg-hover ${
            isCollapsed ? 'justify-center px-0' : 'px-3'
          }`}>
            <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex-shrink-0 flex items-center justify-center text-accent-primary font-bold text-sm">
              {profile && profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ST'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-text-primary">{profile ? profile.name : 'Guest User'}</p>
                <p className="text-xs truncate text-text-secondary">
                  {profile ? `${profile.branch || 'B.Sc. CS'} • Sem ${profile.semester || 6}` : 'Department • Sem'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Outer Container (with spacing on desktop to account for fixed sidebar) */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isCollapsed ? 'md:pl-16' : 'md:pl-64'
      }`}>
        {/* Top Header */}
        <header 
          id="top-header"
          className="sticky top-0 z-20 h-16 bg-surface border-b border-border-subtle flex items-center justify-between px-4 md:px-6 transition-colors duration-150"
        >
          {/* Left: Brand logo for mobile / title & sidebar toggle */}
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-lg text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors border border-border-subtle cursor-pointer"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu size={18} />
            </button>
            <button
              id="mobile-logo-btn"
              onClick={() => setCurrentTab('profile')}
              className="flex items-center gap-2 md:hidden cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold text-lg">
                N
              </div>
              <div className="font-bold tracking-wider text-text-primary text-base">NEXUS</div>
            </button>
          </div>

          {/* Center-aligned global search bar (desktop only) */}
          <div id="desktop-search-container" className="hidden md:block flex-1 max-w-lg mx-auto">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                <Search size={18} />
              </span>
              <input
                id="global-search-bar"
                type="text"
                placeholder={`Search ${navigationItems.find(n => n.id === currentTab)?.label || 'Nexus'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 bg-app border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-secondary focus:outline-hidden focus:ring-1 focus:ring-accent-primary focus:border-accent-primary transition-all"
              />
              {searchQuery && (
                <button 
                  id="clear-global-search"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary hover:text-text-primary"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Settings Button */}
          <div className="flex items-center gap-2">
            <button
              id="settings-nav-btn"
              onClick={() => setCurrentTab('settings')}
              className={`p-2 rounded-lg transition-all duration-150 border cursor-pointer active:scale-95 ${
                currentTab === 'settings'
                  ? 'bg-accent-muted text-accent-hover dark:bg-accent-muted/20 dark:text-accent-primary border-accent-primary'
                  : 'text-text-secondary border-border-subtle hover:bg-bg-hover hover:text-text-primary'
              }`}
              title="Settings & Preferences"
            >
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area yields to children */}
        <main 
          id="main-scroll-container"
          className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6"
        >
          {children}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION: fixed bottom bar like YouTube mobile app */}
      <nav 
        id="mobile-bottom-navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-surface border-t border-border-subtle flex items-center justify-around md:hidden"
      >
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-bottom-nav-item-${item.id}`}
              onClick={() => handleTabClick(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all duration-150"
            >
              <IconComponent 
                size={20} 
                className={isActive ? 'text-accent-primary scale-110' : 'text-text-secondary'} 
              />
              <span 
                className={`text-[9px] mt-1 font-medium tracking-tight truncate max-w-full px-0.5 transition-colors ${
                  isActive ? 'text-accent-primary font-semibold' : 'text-text-secondary'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
