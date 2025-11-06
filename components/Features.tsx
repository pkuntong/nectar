import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => (
  <div className="group bg-dark-card border border-dark-card-border p-8 rounded-xl hover:border-brand-orange/30 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start space-x-5">
      <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-brand-orange/20 to-brand-orange-light/10 text-brand-orange-light group-hover:scale-110 group-hover:shadow-glow-orange-sm transition-all duration-300">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-light-text mb-2 group-hover:text-brand-orange-light transition-colors duration-300">{title}</h3>
        <p className="text-medium-text leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-dark-bg/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-light-text mb-6 tracking-tight">Why Choose Nectar?</h2>
          <p className="text-xl text-medium-text leading-relaxed">We're not just another list of ideas. We provide a tailored platform for growth.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          <FeatureCard
            title="Hyper-Personalized"
            description="Our AI learns your unique skills, passions, and risk tolerance."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <FeatureCard
            title="Low-Cost, High-Impact"
            description="Focus on opportunities with minimal upfront investment for maximum returns."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <FeatureCard
            title="Vetted & Verified"
            description="We filter out the noise and scams, presenting only legitimate opportunities."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <FeatureCard
            title="Track Your Growth"
            description="A beautiful dashboard to monitor your progress and new income streams."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;