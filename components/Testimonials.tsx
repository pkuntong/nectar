import React from 'react';

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatarUrl: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, name, role, avatarUrl }) => (
  <div className="bg-dark-card border border-dark-card-border rounded-xl shadow-lg p-8 transform hover:scale-105 transition-transform duration-300">
    <p className="text-medium-text mb-6 text-lg">"{quote}"</p>
    <div className="flex items-center">
      <img className="w-12 h-12 rounded-full mr-4 object-cover" src={avatarUrl} alt={name} />
      <div>
        <p className="font-bold text-light-text">{name}</p>
        <p className="text-sm text-medium-text">{role}</p>
      </div>
    </div>
  </div>
);


const Testimonials: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-light-text">Loved by Hustlers Everywhere</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="Nectar found me a freelance writing gig that perfectly matched my skills. It's now my main source of income!"
            name="Sarah J."
            role="Freelance Writer"
            avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
          />
          <TestimonialCard
            quote="I wanted to dip my toes into investing but didn't know where to start. Nectar's micro-investment suggestions were a game-changer."
            name="Michael B."
            role="Software Developer"
            avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
          />
          <TestimonialCard
            quote="The sheer quality of opportunities is amazing. I've tried other platforms, and none come close to the personalization of Nectar."
            name="Emily R."
            role="Marketing Manager"
            avatarUrl="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
          />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;