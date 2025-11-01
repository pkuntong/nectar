import React from 'react';

interface TermsPageProps {
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
          Back to Home
        </button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-light-text mb-4">Terms of Service</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-base text-medium-text mb-4">
              <strong className="text-light-text">Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-lg text-medium-text mb-6">
              By using Nectar, you agree to our Terms of Service. This document outlines your rights and responsibilities as a user of our platform. Please read it carefully.
            </p>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Acceptance of Terms</h2>
            <p className="text-lg text-medium-text mb-6">
              By accessing and using Nectar, you accept and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our service.
            </p>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">User Responsibilities</h2>
            <p className="text-lg text-medium-text mb-4">
              As a user, you agree to:
            </p>
            <ul className="list-disc list-inside text-medium-text mb-6 space-y-2">
              <li>Provide accurate and truthful information</li>
              <li>Use the service for lawful purposes only</li>
              <li>Respect the intellectual property of others</li>
              <li>Not attempt to reverse engineer or compromise our systems</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Service Availability</h2>
            <p className="text-lg text-medium-text mb-6">
              We strive to maintain continuous availability of our service, but we do not guarantee uninterrupted or error-free operation. We reserve the right to modify or discontinue any aspect of the service at any time.
            </p>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-lg text-medium-text">
              Nectar provides recommendations and information, but we are not responsible for the success or failure of any side hustle opportunities suggested through our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

