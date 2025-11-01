import React from 'react';

interface CareersPageProps {
  onBack: () => void;
}

const CareersPage: React.FC<CareersPageProps> = ({ onBack }) => {
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
          <h1 className="text-4xl md:text-5xl font-bold text-light-text mb-4">Careers</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-medium-text mb-6">
              Join our passionate team and help us build the future of work. We are always looking for talented individuals who are excited about empowering others.
            </p>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Open Positions</h2>
            <p className="text-lg text-medium-text mb-6">
              We currently have the following positions available:
            </p>
            
            <div className="space-y-6 mb-12">
              <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-xl font-bold text-light-text mb-2">Senior AI Engineer</h3>
                <p className="text-medium-text mb-4">Help us build the next generation of AI-powered recommendations.</p>
                <p className="text-sm text-medium-text mb-4">Remote • Full-time</p>
                <button className="text-brand-orange-light hover:underline font-medium">Learn More</button>
              </div>
              
              <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-xl font-bold text-light-text mb-2">Product Designer</h3>
                <p className="text-medium-text mb-4">Shape the user experience for thousands of aspiring entrepreneurs.</p>
                <p className="text-sm text-medium-text mb-4">Remote • Full-time</p>
                <button className="text-brand-orange-light hover:underline font-medium">Learn More</button>
              </div>
              
              <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-xl font-bold text-light-text mb-2">Marketing Manager</h3>
                <p className="text-medium-text mb-4">Spread the word about Nectar and help people discover their potential.</p>
                <p className="text-sm text-medium-text mb-4">Remote • Full-time</p>
                <button className="text-brand-orange-light hover:underline font-medium">Learn More</button>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-light-text mt-8 mb-4">Why Join Nectar?</h2>
            <ul className="list-disc list-inside text-medium-text mb-6 space-y-2">
              <li>Competitive salary and equity packages</li>
              <li>Remote-first work culture</li>
              <li>Opportunities for professional growth</li>
              <li>Work on meaningful problems that impact people's lives</li>
              <li>Flexible schedule and work-life balance</li>
            </ul>
            
            <p className="text-lg text-medium-text">
              Don't see a position that matches your skills? We're always open to hearing from exceptional people. 
              <button className="text-brand-orange-light hover:underline font-medium ml-2">Send us your resume</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;

