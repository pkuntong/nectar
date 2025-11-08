import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Features from './components/Features';
import DashboardDemo from './components/DashboardDemo';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Modal from './components/Modal';
import Pricing from './components/Pricing';
import Dashboard from './components/Dashboard';
import PricingPage from './components/pages/PricingPage';
import AboutPage from './components/pages/AboutPage';
import PrivacyPage from './components/pages/PrivacyPage';
import TermsPage from './components/pages/TermsPage';
import GoogleOAuthSetupPage from './components/pages/GoogleOAuthSetupPage';
import Login from './components/auth/Login';
// SignUp component removed - now integrated into Login component
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react';

// Mock info components for modals
const InfoContent: React.FC<{ type: string }> = ({ type }) => {
    const content: { [key: string]: { title: string; body: string } } = {
        about: { title: "About Us", body: "Nectar was founded with the mission to empower individuals to achieve financial independence by unlocking their unique potential. Our AI-driven platform connects you with personalized, vetted opportunities, making it easier than ever to start a successful side hustle." },
        privacy: { title: "Privacy Policy", body: "Your privacy is our priority. We use state-of-the-art security to protect your data. This policy outlines how we collect, use, and safeguard your information. We will never sell your data." },
        tos: { title: "Terms of Service", body: "By using Nectar, you agree to our Terms of Service. This document outlines your rights and responsibilities as a user of our platform. Please read it carefully." },
    };
    const currentContent = content[type] || { title: '', body: ''};
    return (
        <div>
            <h3 className="text-xl font-bold mb-4">{currentContent.title}</h3>
            <p className="text-medium-text">{currentContent.body}</p>
        </div>
    );
};


type Page = 'home' | 'pricing' | 'about' | 'privacy' | 'terms' | 'google-oauth-setup';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | 'pricing' | 'info' | null>(null);
  const [infoType, setInfoType] = useState<'pricing' | 'about' | 'privacy' | 'tos'>('about');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showDashboard, setShowDashboard] = useState(true); // Track if we should show dashboard or homepage
  const [error, setError] = useState<string | null>(null);

  // Check auth state on mount
  useEffect(() => {
    // Handle OAuth callback - Supabase automatically processes tokens in URL hash
    const handleOAuthCallback = async () => {
      // Check if URL has OAuth tokens (Supabase adds them to hash)
      const hash = window.location.hash;
      const hasOAuthTokens = hash.includes('access_token') || 
                            hash.includes('type=recovery') || 
                            hash.includes('error=') ||
                            hash.includes('code=');
      
      if (hasOAuthTokens) {
        console.log('OAuth callback detected, waiting for Supabase to process...');
        // Supabase client will automatically process these tokens
        // Check session multiple times with increasing delays to ensure we catch it
        const checkSession = async (attempt = 0) => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session after OAuth:', error);
            if (attempt < 3) {
              setTimeout(() => checkSession(attempt + 1), 500);
            }
            return;
          }
          if (session?.user) {
            console.log('OAuth session found:', session.user.email);
            setUser(session.user);
            setShowDashboard(true);
            setCurrentPage('home');
            setActiveModal(null);
            // Clean up URL - remove OAuth tokens from hash
            window.history.replaceState(null, '', window.location.pathname + '#dashboard');
          } else if (attempt < 5) {
            // Keep checking for up to 2.5 seconds
            setTimeout(() => checkSession(attempt + 1), 500);
          }
        };
        // Start checking after a brief delay
        setTimeout(() => checkSession(), 300);
      }
    };

    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setShowDashboard(true);
      }
    });

    // Handle OAuth callback
    handleOAuthCallback();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      // After OAuth login, show dashboard
      if (session?.user) {
        setShowDashboard(true);
        setCurrentPage('home');
        setActiveModal(null);
        // Update URL to dashboard if we have OAuth tokens
        const hash = window.location.hash;
        if (hash.includes('access_token') || hash.includes('type=recovery')) {
          window.history.replaceState(null, '', window.location.pathname + '#dashboard');
        }
      } else {
        setShowDashboard(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle URL hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      
      // Don't interfere with OAuth tokens
      if (hash.includes('access_token') || hash.includes('type=recovery') || hash.includes('error=') || hash.includes('code=')) {
        return; // Let OAuth callback handler deal with this
      }
      
      if (hash === 'google-oauth-setup') {
        setCurrentPage('google-oauth-setup');
      } else if (hash === 'pricing') {
        setCurrentPage('pricing');
      } else if (hash === 'about') {
        setCurrentPage('about');
      } else if (hash === 'privacy') {
        setCurrentPage('privacy');
      } else if (hash === 'terms') {
        setCurrentPage('terms');
      } else if (hash === 'dashboard') {
        setCurrentPage('home');
        setShowDashboard(true);
      } else if (!hash) {
        setCurrentPage('home');
      }
    };

    // Check initial hash (but delay slightly to let OAuth handler run first)
    setTimeout(() => {
      handleHashChange();
    }, 100);

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLoginSuccess = () => {
    setActiveModal(null);
    setError(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDashboard(false);
  };
  
  const handleNavigateFromDashboard = () => {
    setShowDashboard(false);
  };
  
  const handleDashboardClick = () => {
    setShowDashboard(true);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const closeModal = () => {
    setActiveModal(null);
    setError(null);
  };
  
  const handleInfoClick = (type: 'pricing' | 'about' | 'privacy' | 'tos') => {
      if (type === 'pricing') {
          setCurrentPage('pricing');
      } else if (type === 'about') {
          setCurrentPage('about');
      } else if (type === 'privacy') {
          setCurrentPage('privacy');
      } else if (type === 'tos') {
          setCurrentPage('terms');
      } else {
          setInfoType(type);
          setActiveModal('info');
      }
  };
  
  const handleBackToHome = () => {
      setCurrentPage('home');
  };

  const scrollToDemo = () => {
    document.getElementById('dashboard-demo')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const getModalTitle = () => {
      if (activeModal === 'login') return 'Welcome Back';
      // Removed signup modal - now integrated into login
      if (activeModal === 'pricing') return 'Pricing Plans';
      if (activeModal === 'info') {
          if (infoType === 'tos') return 'Terms of Service';
          if (infoType === 'privacy') return 'Privacy Policy';
          return infoType.charAt(0).toUpperCase() + infoType.slice(1);
      }
      return '';
  };

  const renderCurrentPage = () => {
    if (currentPage === 'pricing') {
      return <PricingPage onBack={handleBackToHome} />;
    }
    if (currentPage === 'about') {
      return <AboutPage onBack={handleBackToHome} />;
    }
    if (currentPage === 'privacy') {
      return <PrivacyPage onBack={handleBackToHome} />;
    }
    if (currentPage === 'terms') {
      return <TermsPage onBack={handleBackToHome} />;
    }
    if (currentPage === 'google-oauth-setup') {
      return <GoogleOAuthSetupPage onBack={handleBackToHome} />;
    }
    
    // Home page
    if (user) {
      // Show dashboard or homepage based on state
      if (showDashboard) {
        return (
          <>
            <Toaster />
            <Dashboard onLogout={handleLogout} onNavigateToHome={handleNavigateFromDashboard} />
          </>
        );
      } else {
        return (
          <>
            <Toaster />
            <Header 
              isLoggedIn={!!user}
              onLoginClick={() => setActiveModal('login')}
              onSignUpClick={() => setActiveModal('login')}
              onLogout={handleLogout}
              onDashboardClick={handleDashboardClick}
            />
            <main>
              <Hero 
                onPrimaryClick={() => setActiveModal('login')} 
                onSecondaryClick={scrollToDemo} 
              />
              <HowItWorks />
              <Features />
              <DashboardDemo
                onSignUpClick={() => setActiveModal('login')}
                onPricingClick={() => handleInfoClick('pricing')}
              />
              <Testimonials />
              <FAQ />
            </main>
            <Footer onInfoClick={handleInfoClick} />
          </>
        );
      }
    }
    
    return (
      <>
        <Toaster />
        <Header
          isLoggedIn={false}
          onLoginClick={() => setActiveModal('login')}
          onSignUpClick={() => setActiveModal('signup')}
          onLogout={handleLogout}
        />
        <main>
          <Hero 
            onPrimaryClick={() => setActiveModal('signup')} 
            onSecondaryClick={scrollToDemo} 
          />
          <HowItWorks />
          <Features />
          <DashboardDemo
            onSignUpClick={() => setActiveModal('signup')}
            onPricingClick={() => handleInfoClick('pricing')}
          />
          <Testimonials />
          <FAQ />
        </main>
        <Footer onInfoClick={handleInfoClick} />
      </>
    );
  };

  return (
    <div className="bg-dark-bg min-h-screen font-sans">
      {renderCurrentPage()}

      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">Close</button>
        </div>
      )}

      <Modal 
        isOpen={activeModal !== null} 
        onClose={closeModal} 
        title={getModalTitle()}
        size={activeModal === 'pricing' ? '2xl' : 'md'}
      >
        {activeModal === 'login' && <Login onLoginSuccess={handleLoginSuccess} onError={handleError} />}
        {activeModal === 'pricing' && <Pricing />}
        {activeModal === 'info' && <InfoContent type={infoType} />}
      </Modal>
    </div>
  );
}

// Wrap App with Sentry Error Boundary
export default Sentry.withProfiler(App);