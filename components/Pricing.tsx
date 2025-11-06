import React, { useState } from 'react';
import { createCheckoutSession, STRIPE_PRICES } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

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
  <div className={`group relative border rounded-2xl p-8 flex flex-col transition-all duration-300 ${isFeatured ? 'bg-dark-bg border-brand-orange shadow-glow-orange scale-105' : 'bg-dark-card border-dark-card-border hover:border-brand-orange/30 hover:shadow-card-hover hover:-translate-y-1'}`}>
    {isFeatured && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
        <span className="bg-gradient-to-r from-brand-orange-light to-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">POPULAR</span>
      </div>
    )}
    <h3 className="text-2xl font-bold text-light-text mb-2">{planName}</h3>
    <p className="mt-4 mb-2">
      <span className="text-5xl font-extrabold text-light-text tracking-tight">{price}</span>
      <span className="text-lg text-medium-text ml-2"> {priceDetails}</span>
    </p>
    <ul className="mt-8 space-y-4 text-medium-text flex-grow">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start group/item">
          <svg className="w-6 h-6 mr-3 text-brand-orange-light flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
          <span className="leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={() => onChoosePlan(planName, price === '$0')}
      disabled={loading}
      className={`w-full mt-8 py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isFeatured ? 'bg-gradient-to-r from-brand-orange-light to-brand-orange text-white hover:scale-105 active:scale-100 shadow-lg shadow-brand-orange/30 hover:shadow-glow-orange-sm' : 'bg-dark-card border-2 border-dark-card-border text-light-text hover:bg-dark-card hover:border-brand-orange/50 hover:text-brand-orange-light'}`}
    >
      {loading ? 'Processing...' : 'Choose Plan'}
    </button>
  </div>
);


const Pricing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChoosePlan = async (planName: string, isFree: boolean) => {
    logger.log('handleChoosePlan called:', { planName, isFree });
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      logger.log('Current user:', user?.id);

      if (!user) {
        const errorMsg = 'Please sign up or log in to continue.';
        setError(errorMsg);
        alert(errorMsg);
        setLoading(false);
        return;
      }

      if (isFree) {
        // Handle free plan - update user subscription in database
        logger.log('Activating free plan for user:', user.id);
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ subscription_tier: 'free' })
          .eq('id', user.id);

        if (updateError) {
          logger.error('Error updating free plan:', updateError);
          throw new Error(`Failed to activate free plan: ${updateError.message}`);
        }

        alert('Free plan activated! You now have access to basic features.');
      } else {
        // Handle paid plan - redirect to Stripe checkout
        logger.log('Creating checkout session for paid plan...');
        const priceId = STRIPE_PRICES.entrepreneur;
        logger.log('Using Price ID:', priceId);

        const result = await createCheckoutSession(priceId);
        logger.log('Checkout session result:', result);

        if (result.error) {
          logger.error('Checkout session error:', result.error);
          throw new Error(result.error);
        }

        // Redirect to Stripe Checkout using the URL
        if (result.url) {
          logger.log('Redirecting to:', result.url);
          window.location.href = result.url;
        } else {
          throw new Error('No checkout URL returned. Please ensure Edge Functions are deployed.');
        }
      }
    } catch (error: any) {
      logger.error('Error in handleChoosePlan:', error);
      const errorMessage = error.message || 'Failed to process plan selection';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-light-text">
        <p className="text-center text-medium-text mb-12 text-lg leading-relaxed">Choose the plan that's right for you and unlock your earning potential.</p>
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-8">
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
                price="$19"
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