import React from 'react';

interface StepCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ title, description, icon }) => (
  <div className="group text-center p-10 bg-dark-card border border-dark-card-border rounded-2xl shadow-card hover:shadow-card-hover hover:border-brand-orange/30 hover:-translate-y-2 transition-all duration-300">
    <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-orange/20 to-brand-orange-light/10 text-brand-orange-light mx-auto mb-6 group-hover:scale-110 group-hover:shadow-glow-orange-sm transition-all duration-300">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 text-light-text group-hover:text-brand-orange-light transition-colors duration-300">{title}</h3>
    <p className="text-medium-text leading-relaxed">{description}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-light-text mb-6 tracking-tight">Start Earning in 3 Simple Steps</h2>
          <p className="text-xl text-medium-text leading-relaxed">We make finding your next income stream effortless. Here's how our AI gets to work for you.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <StepCard 
            title="Tell Us Your Goals"
            description="Answer a few simple questions about your interests, skills, and financial goals."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>}
          />
          <StepCard 
            title="Get AI-Curated Matches"
            description="Our smart algorithm analyzes thousands of opportunities to find the perfect ones for you."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
          />
          <StepCard 
            title="Launch & Track"
            description="Get started with our guides and track your earnings on a simple, intuitive dashboard."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;