import React from 'react';

interface PlanCardProps {
  planName: string;
  price: string;
  priceDetails: string;
  features: string[];
  isFeatured?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ planName, price, priceDetails, features, isFeatured }) => (
  <div className={`border rounded-lg p-6 flex flex-col ${isFeatured ? 'bg-dark-bg border-brand-orange' : 'bg-dark-card border-dark-card-border'}`}>
    <h3 className="text-xl font-bold text-light-text">{planName}</h3>
    <p className="mt-4">
      <span className="text-4xl font-extrabold text-light-text">{price}</span>
      <span className="text-medium-text"> {priceDetails}</span>
    </p>
    <ul className="mt-6 space-y-4 text-medium-text flex-grow">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <svg className="w-5 h-5 mr-2 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button className={`w-full mt-8 py-3 rounded-md font-bold transition-opacity ${isFeatured ? 'bg-gradient-to-r from-brand-orange-light to-brand-orange text-white hover:opacity-90' : 'bg-dark-card border border-dark-card-border text-light-text hover:bg-white/5'}`}>
      Choose Plan
    </button>
  </div>
);


const Pricing: React.FC = () => {
  return (
    <div className="text-light-text">
        <p className="text-center text-medium-text mb-8">Choose the plan that's right for you and unlock your earning potential.</p>
        <div className="grid sm:grid-cols-2 gap-6">
            <PlanCard 
                planName="Hustler"
                price="$0"
                priceDetails="/ forever"
                features={[
                    '5 AI-powered recommendations / week',
                    'Basic progress tracking',
                    'Community access'
                ]}
            />
            <PlanCard 
                planName="Entrepreneur"
                price="$19"
                priceDetails="/ month"
                isFeatured={true}
                features={[
                    'Unlimited AI recommendations',
                    'Advanced analytics & insights',
                    'Exclusive opportunities',
                    'Priority support'
                ]}
            />
        </div>
    </div>
  );
};

export default Pricing;