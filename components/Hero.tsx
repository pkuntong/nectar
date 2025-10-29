import React from 'react';

interface HeroProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPrimaryClick, onSecondaryClick }) => {
  return (
    <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 text-center">
      <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-light-text leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Stop Dreaming, Start Earning
            </h1>
            <p className="text-lg md:text-xl text-medium-text max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Nectar's AI analyzes your skills and passions to uncover personalized, high-potential side hustles just for you. Your next income stream is just a click away.
            </p>
            <div className="flex justify-center items-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <button onClick={onPrimaryClick} className="bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-8 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-orange/30">
                Get Started For Free
              </button>
              <button onClick={onSecondaryClick} className="bg-dark-card border border-dark-card-border text-light-text font-medium py-3 px-8 rounded-md hover:bg-white/5 transition-colors">
                See The Demo
              </button>
            </div>
          </div>
      </div>
    </section>
  );
};

export default Hero;