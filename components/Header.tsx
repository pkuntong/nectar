import React, { useState, useEffect } from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center space-x-3">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear_logo)"/>
      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="url(#paint1_linear_logo)"/>
      <defs>
        <linearGradient id="paint0_linear_logo" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316"/>
          <stop offset="1" stopColor="#EA580C"/>
        </linearGradient>
        <linearGradient id="paint1_linear_logo" x1="12" y1="12" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.7"/>
          <stop offset="1" stopColor="#EA580C" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
    <span className="font-bold text-2xl text-light-text tracking-wide">Nectar</span>
  </div>
);

interface HeaderProps {
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogout: () => void;
  onDashboardClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onLoginClick, onSignUpClick, onLogout, onDashboardClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-dark-bg/95 backdrop-blur-md border-b border-dark-card-border shadow-card' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => handleNavClick('top')}
          className="group transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <Logo />
        </button>
        {!isLoggedIn && (
            <nav className="hidden md:flex items-center space-x-10">
              <button 
                onClick={() => handleNavClick('how-it-works')} 
                className="text-medium-text hover:text-light-text transition-all duration-300 relative group"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
              </button>
              <button 
                onClick={() => handleNavClick('features')} 
                className="text-medium-text hover:text-light-text transition-all duration-300 relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
              </button>
              <button 
                onClick={() => handleNavClick('dashboard-demo')} 
                className="text-medium-text hover:text-light-text transition-all duration-300 relative group"
              >
                Demo
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300"></span>
              </button>
            </nav>
        )}
        <div className="flex items-center space-x-3">
            {isLoggedIn ? (
                <>
                    {onDashboardClick && (
                        <button 
                          onClick={onDashboardClick} 
                          className="bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-2.5 px-6 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
                        >
                            Dashboard
                        </button>
                    )}
                    <button 
                      onClick={onLogout} 
                      className="bg-dark-card/80 backdrop-blur-sm border border-dark-card-border text-light-text font-medium py-2.5 px-6 rounded-lg hover:bg-dark-card hover:border-brand-orange/30 transition-all duration-300"
                    >
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <button 
                      onClick={onLoginClick} 
                      className="text-light-text font-medium py-2.5 px-6 rounded-lg hover:bg-white/5 transition-all duration-300"
                    >
                        Login
                    </button>
                    <button 
                      onClick={onSignUpClick} 
                      className="bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-2.5 px-6 rounded-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm"
                    >
                        Sign Up for Free
                    </button>
                </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
