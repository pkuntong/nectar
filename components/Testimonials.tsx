import React from 'react';

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-dark-bg">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-light-text mb-6">
            Built for Real Hustlers
          </h2>
          <p className="text-xl text-medium-text max-w-3xl mx-auto">
            We're building Nectar Forge with one mission: help you discover and validate your next income stream with AI-powered insights.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg">
            <div className="text-brand-orange text-4xl font-bold mb-4">AI-Powered</div>
            <h3 className="text-xl font-bold text-light-text mb-3">Smart Recommendations</h3>
            <p className="text-medium-text">
              Our AI analyzes your skills, interests, and market trends to suggest side hustles that actually fit your lifestyle.
            </p>
          </div>

          <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg">
            <div className="text-brand-orange text-4xl font-bold mb-4">No BS</div>
            <h3 className="text-xl font-bold text-light-text mb-3">Honest Guidance</h3>
            <p className="text-medium-text">
              We don't promise overnight success. We provide real strategies, vetted opportunities, and transparent expectations.
            </p>
          </div>

          <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg">
            <div className="text-brand-orange text-4xl font-bold mb-4">Your Success</div>
            <h3 className="text-xl font-bold text-light-text mb-3">We Grow Together</h3>
            <p className="text-medium-text">
              As you build your side hustle, you're helping us build a better platform. Real feedback. Real improvements. Real results.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-brand-orange/10 to-brand-orange-light/10 border border-brand-orange/20 p-8 rounded-lg text-center">
          <p className="text-lg text-light-text mb-4">
            <span className="font-bold">Early Access:</span> You're using Nectar Forge during our growth phase.
          </p>
          <p className="text-medium-text">
            Your feedback shapes our features. Your success stories will inspire our community. Join us on this journey.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;