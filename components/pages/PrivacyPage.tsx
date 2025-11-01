import React from 'react';

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-light-text mb-4">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-base text-medium-text mb-4">
              <strong className="text-light-text">Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
            <p className="text-lg text-medium-text mb-6">
              Your privacy is our priority. We use state-of-the-art security to protect your data. This policy outlines how we collect, use, and safeguard your information. We will never sell your data.
            </p>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Information We Collect</h2>
            <p className="text-lg text-medium-text mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-medium-text mb-6 space-y-2">
              <li>Account information (email, name, password)</li>
              <li>Profile information (interests, skills, preferences)</li>
              <li>Usage data and interactions with our platform</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-lg text-medium-text mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-medium-text mb-6 space-y-2">
              <li>Provide and personalize our service</li>
              <li>Generate AI-powered recommendations</li>
              <li>Communicate with you about your account and our services</li>
              <li>Improve our platform and develop new features</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Data Security</h2>
            <p className="text-lg text-medium-text">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

