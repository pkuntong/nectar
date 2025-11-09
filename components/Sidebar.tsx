import React, { useState } from 'react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  onLogoClick?: () => void;
}

const SidebarItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, text, isActive, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${isActive ? 'bg-brand-orange/10 text-brand-orange-light font-bold' : 'text-medium-text hover:bg-dark-card hover:text-light-text'}`}
  >
    {icon}
    <span className="ml-4">{text}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, onLogoClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleItemClick = (item: string) => {
    onItemClick(item);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  const menuItems = [
    { id: 'dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>, text: 'Dashboard' },
    { id: 'find', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>, text: 'Find Hustles' },
    { id: 'myhustles', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, text: 'My Hustles' },
    { id: 'community', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, text: 'Community' },
    { id: 'pricing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Pricing' },
  ];

  const bottomMenuItems = [
    { id: 'settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, text: 'Settings' },
    { id: 'help', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Help & Support' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-dark-bg border-r border-dark-card-border p-6 flex-col hidden md:flex">
        <button
          onClick={onLogoClick || (() => window.location.href = '/')}
          className="flex items-center space-x-3 mb-10 hover:opacity-80 transition-opacity"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear_logo_sidebar)"/>
            <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="url(#paint1_linear_logo_sidebar)"/>
            <defs>
              <linearGradient id="paint0_linear_logo_sidebar" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F97316"/>
                <stop offset="1" stopColor="#EA580C"/>
              </linearGradient>
              <linearGradient id="paint1_linear_logo_sidebar" x1="12" y1="12" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F97316" stopOpacity="0.7"/>
                <stop offset="1" stopColor="#EA580C" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="font-bold text-2xl text-light-text tracking-wide">Nectar Forge</span>
        </button>

        <nav className="flex-grow space-y-2">
          {menuItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              isActive={activeItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          {bottomMenuItems.map(item => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              isActive={activeItem === item.id}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </div>
      </aside>

      {/* Mobile: Hamburger Menu Button + Drawer */}
      <div className="md:hidden">
        {/* Hamburger Button - Fixed Top Left */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-card border border-dark-card-border text-light-text touchable ripple"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <aside className="fixed top-0 left-0 h-full w-72 bg-dark-bg border-r border-dark-card-border p-6 z-50 flex flex-col modal-enter safe-area-inset-left">
              {/* Logo */}
              <button
                onClick={onLogoClick || (() => window.location.href = '/')}
                className="flex items-center space-x-3 mb-8 hover:opacity-80 transition-opacity"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear_logo_mobile)"/>
                  <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="url(#paint1_linear_logo_mobile)"/>
                  <defs>
                    <linearGradient id="paint0_linear_logo_mobile" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F97316"/>
                      <stop offset="1" stopColor="#EA580C"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_logo_mobile" x1="12" y1="12" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F97316" stopOpacity="0.7"/>
                      <stop offset="1" stopColor="#EA580C" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-bold text-xl text-light-text tracking-wide">Nectar Forge</span>
              </button>

              {/* Menu Items */}
              <nav className="flex-grow space-y-2 overflow-y-auto">
                {menuItems.map(item => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    text={item.text}
                    isActive={activeItem === item.id}
                    onClick={() => handleItemClick(item.id)}
                  />
                ))}
              </nav>

              {/* Bottom Items */}
              <div className="mt-auto space-y-2 pt-4 border-t border-dark-card-border">
                {bottomMenuItems.map(item => (
                  <SidebarItem
                    key={item.id}
                    icon={item.icon}
                    text={item.text}
                    isActive={activeItem === item.id}
                    onClick={() => handleItemClick(item.id)}
                  />
                ))}
              </div>
            </aside>
          </>
        )}
      </div>

      {/* Mobile: Bottom Navigation Bar (iOS/Android style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-bg/95 backdrop-blur-lg border-t border-dark-card-border safe-area-inset-bottom z-30">
        <div className="flex justify-around items-center px-2 py-2">
          {/* Show only 4 most important items in bottom nav */}
          <button
            onClick={() => handleItemClick('dashboard')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${activeItem === 'dashboard' ? 'text-brand-orange' : 'text-medium-text'} touchable`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>

          <button
            onClick={() => handleItemClick('find')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${activeItem === 'find' ? 'text-brand-orange' : 'text-medium-text'} touchable`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">Find</span>
          </button>

          <button
            onClick={() => handleItemClick('myhustles')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${activeItem === 'myhustles' ? 'text-brand-orange' : 'text-medium-text'} touchable`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-1">Hustles</span>
          </button>

          <button
            onClick={() => handleItemClick('settings')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${activeItem === 'settings' ? 'text-brand-orange' : 'text-medium-text'} touchable`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
