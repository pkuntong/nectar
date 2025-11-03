import React, { useState, useEffect } from 'react';
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
import CareersPage from './components/pages/CareersPage';
import Login from './components/auth/Login';
import SignUpComponent from './components/auth/SignUp';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import * as Sentry from '@sentry/react';

// Mock info components for modals
const InfoContent: React.FC<{ type: string }> = ({ type }) => {
    const content: { [key: string]: { title: string; body: string } } = {
        about: { title: "About Us", body: "Nectar was founded with the mission to empower individuals to achieve financial independence by unlocking their unique potential. Our AI-driven platform connects you with personalized, vetted opportunities, making it easier than ever to start a successful side hustle." },
        careers: { title: "Careers", body: "Join our passionate team and help us build the future of work. We are always looking for talented individuals who are excited about empowering others. Check our careers page for open positions." },
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


type Page = 'home' | 'pricing' | 'about' | 'privacy' | 'terms' | 'careers';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | 'pricing' | 'info' | null>(null);
  const [infoType, setInfoType] = useState<'pricing' | 'about' | 'careers' | 'privacy' | 'tos'>('about');
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showDashboard, setShowDashboard] = useState(true); // Track if we should show dashboard or homepage
  const [error, setError] = useState<string | null>(null);

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = () => {
    setActiveModal(null);
    setError(null);
  };
  
  const handleSignUpSuccess = () => {
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
  
  const handleInfoClick = (type: 'pricing' | 'about' | 'careers' | 'privacy' | 'tos') => {
      if (type === 'pricing') {
          setCurrentPage('pricing');
      } else if (type === 'about') {
          setCurrentPage('about');
      } else if (type === 'careers') {
          setCurrentPage('careers');
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
      if (activeModal === 'signup') return 'Create Your Account';
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
    if (currentPage === 'careers') {
      return <CareersPage onBack={handleBackToHome} />;
    }
    if (currentPage === 'privacy') {
      return <PrivacyPage onBack={handleBackToHome} />;
    }
    if (currentPage === 'terms') {
      return <TermsPage onBack={handleBackToHome} />;
    }
    
    // Home page
    if (user) {
      // Show dashboard or homepage based on state
      if (showDashboard) {
        return <Dashboard onLogout={handleLogout} onNavigateToHome={handleNavigateFromDashboard} />;
      } else {
        return (
          <>
            <Header 
              isLoggedIn={!!user}
              onLoginClick={() => setActiveModal('login')}
              onSignUpClick={() => setActiveModal('signup')}
              onLogout={handleLogout}
              onDashboardClick={handleDashboardClick}
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
      }
    }
    
    return (
      <>
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
        {activeModal === 'signup' && <SignUpComponent onSignUpSuccess={handleSignUpSuccess} onError={handleError} />}
        {activeModal === 'pricing' && <Pricing />}
        {activeModal === 'info' && <InfoContent type={infoType} />}
      </Modal>
    </div>
  );
}

// Wrap App with Sentry Error Boundary
export default Sentry.withProfiler(App);