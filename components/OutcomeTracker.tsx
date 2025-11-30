import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface OutcomeTrackerProps {
  hustleName: string;
  generatedDate: Date;
}

/**
 * Outcome Tracking Component
 *
 * Prompts users at key intervals to report whether they:
 * 1. Took action on the hustle
 * 2. Launched the hustle
 * 3. Earned their first dollar
 *
 * This is CRITICAL data to validate product value.
 */
const OutcomeTracker: React.FC<OutcomeTrackerProps> = ({ hustleName, generatedDate }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [step, setStep] = useState<'action' | 'launch' | 'revenue'>('action');
  const [response, setResponse] = useState<{
    tookAction: boolean | null;
    launched: boolean | null;
    revenue: number | null;
    feedback: string;
  }>({
    tookAction: null,
    launched: null,
    revenue: null,
    feedback: '',
  });

  useEffect(() => {
    // Check if we should show prompt based on time elapsed
    const daysSinceGeneration = Math.floor(
      (new Date().getTime() - new Date(generatedDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Show prompts at Day 7, Day 30, Day 60
    if (daysSinceGeneration === 7 || daysSinceGeneration === 30 || daysSinceGeneration === 60) {
      // Check if user already responded for this hustle
      checkExistingResponse();
    }
  }, [generatedDate, hustleName]);

  const checkExistingResponse = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('hustle_outcomes')
        .select('*')
        .eq('user_id', user.id)
        .eq('hustle_name', hustleName)
        .single();

      if (!data) {
        // No response yet, show prompt
        setShowPrompt(true);
      }
    } catch (error) {
      logger.error('Error checking outcome response:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to database
      const { error } = await supabase
        .from('hustle_outcomes')
        .upsert({
          user_id: user.id,
          hustle_name: hustleName,
          took_action: response.tookAction,
          launched: response.launched,
          revenue: response.revenue,
          feedback: response.feedback,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Thank user and close
      alert('Thank you! Your feedback helps us improve and helps other users see what actually works.');
      setShowPrompt(false);
    } catch (error) {
      logger.error('Error saving outcome:', error);
      alert('Failed to save your response. Please try again.');
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-dark-card border border-brand-orange rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-light-text mb-4">
          Quick Check-In: {hustleName}
        </h3>

        {step === 'action' && (
          <>
            <p className="text-medium-text mb-4">
              You generated this hustle idea {Math.floor((new Date().getTime() - new Date(generatedDate).getTime()) / (1000 * 60 * 60 * 24))} days ago.
              Did you take ANY action on it?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResponse({ ...response, tookAction: true });
                  setStep('launch');
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Yes, I took action
              </button>
              <button
                onClick={() => {
                  setResponse({ ...response, tookAction: false });
                  setShowPrompt(false);
                  handleSubmit();
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                No, not yet
              </button>
            </div>
          </>
        )}

        {step === 'launch' && (
          <>
            <p className="text-medium-text mb-4">
              Awesome! Did you actually LAUNCH this hustle? (e.g., made it available to customers, started offering the service)
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResponse({ ...response, launched: true });
                  setStep('revenue');
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Yes, I launched! 🚀
              </button>
              <button
                onClick={() => {
                  setResponse({ ...response, launched: false });
                  handleSubmit();
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                Not yet, still preparing
              </button>
            </div>
          </>
        )}

        {step === 'revenue' && (
          <>
            <p className="text-medium-text mb-4">
              Congratulations on launching! 🎉 Have you made any money from this hustle yet?
            </p>
            <input
              type="number"
              placeholder="Enter amount (e.g., 150)"
              className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text mb-3"
              onChange={(e) => setResponse({ ...response, revenue: parseFloat(e.target.value) || 0 })}
            />
            <textarea
              placeholder="Optional: Any lessons learned or tips for others trying this hustle?"
              className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text mb-4 h-24"
              onChange={(e) => setResponse({ ...response, feedback: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-brand-orange text-white py-3 rounded-lg hover:opacity-90"
              >
                Submit & Celebrate 🎊
              </button>
              <button
                onClick={() => {
                  setResponse({ ...response, revenue: 0 });
                  handleSubmit();
                }}
                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700"
              >
                Not yet, but soon!
              </button>
            </div>
          </>
        )}

        <button
          onClick={() => setShowPrompt(false)}
          className="mt-4 text-sm text-medium-text hover:text-light-text"
        >
          Ask me later
        </button>
      </div>
    </div>
  );
};

export default OutcomeTracker;
