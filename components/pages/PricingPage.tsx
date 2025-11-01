import React from 'react';

interface PricingPageProps {
  onBack: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-light-text mb-4">Pricing Plans</h1>
          <p className="text-lg text-medium-text mb-12">Choose the plan that's right for you and unlock your earning potential.</p>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-12">
            <div className="border rounded-lg p-6 flex flex-col bg-dark-card border-dark-card-border">
              <h3 className="text-xl font-bold text-light-text">Hustler</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-light-text">$0</span>
                <span className="text-medium-text"> / forever</span>
              </p>
              <ul className="mt-6 space-y-4 text-medium-text flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>5 AI-powered recommendations / week</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Basic progress tracking</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Community access</span>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 rounded-md font-bold transition-opacity bg-dark-card border border-dark-card-border text-light-text hover:bg-white/5">
                Choose Plan
              </button>
            </div>
            
            <div className="border rounded-lg p-6 flex flex-col bg-dark-bg border-brand-orange">
              <h3 className="text-xl font-bold text-light-text">Entrepreneur</h3>
              <p className="mt-4">
                <span className="text-4xl font-extrabold text-light-text">$19</span>
                <span className="text-medium-text"> / month</span>
              </p>
              <ul className="mt-6 space-y-4 text-medium-text flex-grow">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Unlimited AI recommendations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Exclusive opportunities</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full mt-8 py-3 rounded-md font-bold transition-opacity bg-gradient-to-r from-brand-orange-light to-brand-orange text-white hover:opacity-90">
                Choose Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

