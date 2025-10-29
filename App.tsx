import React, { useState } from 'react';
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

// Mock Auth components for modals
const Login: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => (
    <div>
        <p className="text-medium-text mb-6">Enter your credentials to access your dashboard.</p>
        <form onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }}>
            <div className="space-y-4">
                <input type="email" placeholder="Email" className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" required />
                <input type="password" placeholder="Password" className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" required />
            </div>
            <div className="flex items-center justify-between mt-4">
                <label className="flex items-center text-sm text-medium-text select-none cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 rounded border-dark-card-border bg-dark-bg text-brand-orange focus:ring-brand-orange focus:ring-offset-dark-card" />
                    <span className="ml-2">Remember me</span>
                </label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-brand-orange-light hover:underline">Forgot password?</a>
            </div>
            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-5 rounded-md hover:opacity-90 transition-opacity">
                Login
            </button>
        </form>
    </div>
);

const SignUp: React.FC<{ onSignUpSuccess: () => void }> = ({ onSignUpSuccess }) => (
    <div>
        <p className="text-medium-text mb-6">Create your account to start finding your next income stream.</p>
        <form onSubmit={(e) => { e.preventDefault(); onSignUpSuccess(); }}>
            <div className="space-y-4">
                 <input type="text" placeholder="Full Name" className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" required />
                <input type="email" placeholder="Email" className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" required />
                <input type="password" placeholder="Password" className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none" required />
            </div>
            <button type="submit" className="w-full mt-6 bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-5 rounded-md hover:opacity-90 transition-opacity">
                Create Account
            </button>
        </form>
    </div>
);

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


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModal, setActiveModal] = useState<'login' | 'signup' | 'pricing' | 'info' | null>(null);
  const [infoType, setInfoType] = useState<'pricing' | 'about' | 'careers' | 'privacy' | 'tos'>('about');

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActiveModal(null);
  };
  
  const handleSignUpSuccess = () => {
    setIsLoggedIn(true);
    setActiveModal(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  const handleInfoClick = (type: 'pricing' | 'about' | 'careers' | 'privacy' | 'tos') => {
      if (type === 'pricing') {
          setActiveModal('pricing');
      } else {
          setInfoType(type);
          setActiveModal('info');
      }
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

  return (
    <div className="bg-dark-bg min-h-screen font-sans">
      {!isLoggedIn && <Header 
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setActiveModal('login')}
        onSignUpClick={() => setActiveModal('signup')}
        onLogout={handleLogout}
      />}

      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <main>
          <Hero 
            onPrimaryClick={() => setActiveModal('signup')} 
            onSecondaryClick={scrollToDemo} 
          />
          <HowItWorks />
          <Features />
          <DashboardDemo onSignUpClick={() => setActiveModal('signup')} />
          <Testimonials />
          <FAQ />
        </main>
      )}

      {!isLoggedIn && <Footer onInfoClick={handleInfoClick} />}

      <Modal 
        isOpen={activeModal !== null} 
        onClose={() => setActiveModal(null)} 
        title={getModalTitle()}
        size={activeModal === 'pricing' ? '2xl' : 'md'}
      >
        {activeModal === 'login' && <Login onLoginSuccess={handleLoginSuccess} />}
        {activeModal === 'signup' && <SignUp onSignUpSuccess={handleSignUpSuccess}/>}
        {activeModal === 'pricing' && <Pricing />}
        {activeModal === 'info' && <InfoContent type={infoType} />}
      </Modal>
    </div>
  );
}

export default App;