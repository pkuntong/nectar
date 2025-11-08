import React from 'react';
import GoogleOAuthSetup from '../GoogleOAuthSetup';

interface GoogleOAuthSetupPageProps {
  onBack: () => void;
}

const GoogleOAuthSetupPage: React.FC<GoogleOAuthSetupPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-dark-bg py-20">
      <div className="container mx-auto px-6">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center text-medium-text hover:text-light-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <GoogleOAuthSetup />
      </div>
    </div>
  );
};

export default GoogleOAuthSetupPage;

