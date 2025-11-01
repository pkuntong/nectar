import React, { useState } from 'react';
import { createCheckoutSession, STRIPE_PRICES } from '../lib/stripe';
import { supabase } from '../lib/supabase';

interface PlanCardProps {
  planName: string;
  price: string;
  priceDetails: string;
  features: string[];
  isFeatured?: boolean;
  onChoosePlan: (planName: string, isFree: boolean) => void;
  loading?: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ planName, price, priceDetails, features, isFeatured, onChoosePlan, loading }) => (
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
    <button 
      onClick={() => onChoosePlan(planName, price === '$0')}
      disabled={loading}
      className={`w-full mt-8 py-3 rounded-md font-bold transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${isFeatured ? 'bg-gradient-to-r from-brand-orange-light to-brand-orange text-white hover:opacity-90' : 'bg-dark-card border border-dark-card-border text-light-text hover:bg-white/5'}`}
    >
      {loading ? 'Processing...' : 'Choose Plan'}
    </button>
  </div>
);


const Pricing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChoosePlan = async (planName: string, isFree: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign up or log in to continue.');
        setLoading(false);
        return;
      }

      if (isFree) {
        // Handle free plan - update user subscription in database
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating free plan:', updateError);
        }

        alert('Free plan activated! You now have access to basic features.');
      } else {
        // Handle paid plan - redirect to Stripe checkout
        const priceId = STRIPE_PRICES.entrepreneur;
        const result = await createCheckoutSession(priceId);

        if (result.error) {
          throw new Error(result.error);
        }

        // Redirect to Stripe Checkout using the URL
        if (result.url) {
          window.location.href = result.url;
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process plan selection');
      console.error('Error choosing plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-light-text">
        <p className="text-center text-medium-text mb-8">Choose the plan that's right for you and unlock your earning potential.</p>
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
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
                onChoosePlan={handleChoosePlan}
                loading={loading}
            />
            <PlanCard
                planName="Entrepreneur"
                price="$29"
                priceDetails="/ month"
                isFeatured={true}
                features={[
                    'Unlimited AI recommendations',
                    'Advanced analytics & insights',
                    'Exclusive opportunities',
                    'Priority support'
                ]}
                onChoosePlan={handleChoosePlan}
                loading={loading}
            />
        </div>
    </div>
  );
};

export default Pricing;