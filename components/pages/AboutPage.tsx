import React from 'react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-light-text mb-4">About Us</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-medium-text mb-6">
              Nectar Forge was founded with the mission to empower individuals to achieve financial independence by unlocking their unique potential. Our AI-driven platform connects you with personalized, vetted opportunities, making it easier than ever to start a successful side hustle.
            </p>
            <p className="text-lg text-medium-text mb-6">
              We believe that everyone has untapped potential to generate additional income streams. Whether you're looking to supplement your current salary, pursue your passions, or build a path to financial freedom, Nectar Forge is here to help you discover the right opportunities.
            </p>
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Our Mission</h2>
            <p className="text-lg text-medium-text">
              To democratize access to meaningful side hustle opportunities through AI-powered personalization, making it possible for anyone to find their perfect income stream match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

