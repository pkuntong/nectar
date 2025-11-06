import React from 'react';

interface HeroProps {
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onPrimaryClick, onSecondaryClick }) => {
  return (
    <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 text-center overflow-hidden">
      <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-light-text leading-[1.1] mb-8 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Stop Dreaming,<br />
              <span className="bg-gradient-to-r from-brand-orange-light via-brand-orange to-brand-orange-light bg-clip-text text-transparent">Start Earning</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-medium-text max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Nectar's AI analyzes your skills and passions to uncover personalized, high-potential side hustles just for you. Your next income stream is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <button 
                onClick={onPrimaryClick} 
                className="group relative bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-4 px-10 rounded-xl text-lg hover:scale-105 active:scale-100 transition-all duration-300 shadow-2xl shadow-brand-orange/40 hover:shadow-glow-orange"
              >
                <span className="relative z-10">Get Started For Free</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-orange to-brand-orange-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button 
                onClick={onSecondaryClick} 
                className="bg-dark-card/80 backdrop-blur-sm border border-dark-card-border text-light-text font-semibold py-4 px-10 rounded-xl hover:bg-dark-card hover:border-brand-orange/30 hover:text-brand-orange-light transition-all duration-300 shadow-card hover:shadow-card-hover"
              >
                See The Demo
              </button>
            </div>
          </div>
      </div>
    </section>
  );
};

export default Hero;