import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createCheckoutSession, STRIPE_PRICES } from '../lib/stripe';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import DashboardDemo from './DashboardDemo';
import FAQ from './FAQ'; // Import the FAQ component
import Pricing from './Pricing';
import { logger } from '../lib/logger';

const DashboardHome: React.FC = () => {
    const [savedHustlesCount, setSavedHustlesCount] = useState(0);

    useEffect(() => {
        // Load actual saved hustles count
        const savedData = localStorage.getItem('nectar_saved_hustles_data');
        if (savedData) {
            try {
                const hustlesData = JSON.parse(savedData);
                setSavedHustlesCount(hustlesData.length);
            } catch (e) {
                logger.error('Error loading saved hustles count:', e);
            }
        }
    }, []);

    return (
        <div className="p-4 md:p-8 animate-fade-in-up">
            <h2 className="text-2xl md:text-3xl font-bold text-light-text mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                    <h3 className="text-medium-text font-semibold">Saved Hustles</h3>
                    <p className="text-3xl font-bold text-light-text mt-2">{savedHustlesCount}</p>
                    <p className="text-sm text-medium-text mt-1">
                        {savedHustlesCount === 0 ? 'No hustles saved yet' : `${savedHustlesCount} hustle${savedHustlesCount === 1 ? '' : 's'} saved`}
                    </p>
                </div>
                <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                    <h3 className="text-medium-text font-semibold">Get Started</h3>
                    <p className="text-lg font-bold text-light-text mt-2">Find Hustles</p>
                    <p className="text-sm text-medium-text mt-1">Generate AI-powered side hustle ideas</p>
                </div>
            </div>
            <div className="mt-8 bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-xl font-bold text-light-text mb-4">Your Recent Activity</h3>
                <p className="text-medium-text">Your recent activity will appear here as you use the platform. Try generating some side hustle ideas to get started!</p>
            </div>
        </div>
    );
};

interface Hustle {
    hustleName: string;
    description: string;
    estimatedProfit: string;
    upfrontCost: string;
    timeCommitment: string;
    requiredSkills: string[];
    potentialChallenges: string;
    learnMoreLink: string;
}

const MyHustles: React.FC = () => {
    const [savedHustles, setSavedHustles] = useState<Hustle[]>([]);
    const [expandedHustle, setExpandedHustle] = useState<string | null>(null);

    useEffect(() => {
        // Try to load full hustle data first
        const savedData = localStorage.getItem('nectar_saved_hustles_data');
        if (savedData) {
            try {
                const hustlesData = JSON.parse(savedData);
                setSavedHustles(hustlesData);
            } catch (e) {
                logger.error('Error loading saved hustles data:', e);
            }
        } else {
            // Fallback to old format (names only)
            const saved = localStorage.getItem('nectar_saved_hustles');
            if (saved) {
                try {
                    const savedArray = JSON.parse(saved);
                    // Convert names to basic hustle objects
                    const basicHustles = savedArray.map((name: string) => ({
                        hustleName: name,
                        description: 'Click "View Details" to see full information',
                        estimatedProfit: 'N/A',
                        upfrontCost: 'N/A',
                        timeCommitment: 'N/A',
                        requiredSkills: [],
                        potentialChallenges: 'N/A',
                        learnMoreLink: '/dashboard?tab=find'
                    }));
                    setSavedHustles(basicHustles);
                } catch (e) {
                    logger.error('Error loading saved hustles:', e);
                }
            }
        }
    }, []);

    const handleRemove = (hustleName: string) => {
        const updated = savedHustles.filter(h => h.hustleName !== hustleName);
        setSavedHustles(updated);
        localStorage.setItem('nectar_saved_hustles_data', JSON.stringify(updated));
        localStorage.setItem('nectar_saved_hustles', JSON.stringify(updated.map(h => h.hustleName)));
        if (expandedHustle === hustleName) {
            setExpandedHustle(null);
        }
    };

    const handleView = (hustleName: string) => {
        setExpandedHustle(expandedHustle === hustleName ? null : hustleName);
    };

    if (savedHustles.length === 0) {
        return (
            <div className="p-8 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-light-text mb-6">My Hustles</h2>
                <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                    <p className="text-medium-text mb-4">You haven't saved any hustles yet. Start by exploring opportunities in "Find Hustles" and save the ones that interest you!</p>
                    <button onClick={() => window.location.href = '/dashboard?tab=find'} className="bg-brand-orange text-white font-bold py-2 px-5 rounded-md hover:opacity-90 transition-opacity">
                        Find Hustles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-light-text mb-6">My Hustles</h2>
            <div className="space-y-4">
                {savedHustles.map((hustle, index) => (
                    <div key={index} className="bg-dark-card border border-dark-card-border rounded-lg overflow-hidden">
                        <div
                            className="p-6 flex justify-between items-center cursor-pointer hover:bg-dark-bg/50 transition-colors"
                            onClick={() => handleView(hustle.hustleName)}
                        >
                            <div className="flex-1 pointer-events-none">
                                <h3 className="text-xl font-bold text-light-text">{hustle.hustleName}</h3>
                                <p className="text-medium-text mt-2">{hustle.description.substring(0, 100)}...</p>
                                <p className="text-sm text-brand-orange mt-2">
                                    {expandedHustle === hustle.hustleName ? '▼ Click to hide details' : '▶ Click to view details'}
                                </p>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => handleRemove(hustle.hustleName)}
                                    className="border border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition-colors py-2 px-4 rounded-md font-semibold"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {expandedHustle === hustle.hustleName && (
                            <div className="border-t border-dark-card-border p-6 bg-dark-bg/50 animate-fade-in-up">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-brand-orange mb-2">Description</h4>
                                        <p className="text-medium-text">{hustle.description}</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-brand-orange mb-1">Estimated Profit</h4>
                                            <p className="text-light-text">{hustle.estimatedProfit}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-brand-orange mb-1">Upfront Cost</h4>
                                            <p className="text-light-text">{hustle.upfrontCost}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-brand-orange mb-1">Time Commitment</h4>
                                            <p className="text-light-text">{hustle.timeCommitment}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-brand-orange mb-1">Required Skills</h4>
                                            <p className="text-light-text">{hustle.requiredSkills.join(', ')}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-bold text-brand-orange mb-2">Potential Challenges</h4>
                                        <p className="text-medium-text">{hustle.potentialChallenges}</p>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <a
                                            href={hustle.learnMoreLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 bg-brand-orange text-white font-semibold py-3 px-6 rounded-md hover:opacity-90 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                            </svg>
                                            Learn More (External Link)
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsContent: React.FC<{ onProfileUpdate?: () => void }> = ({ onProfileUpdate }) => {
    const [notifications, setNotifications] = useState({ weekly: false, product: false, offers: false });
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [subscriptionTier, setSubscriptionTier] = useState<string>('free');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        // Load user profile on mount
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || '');
                setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');

                // Load subscription tier and notification preferences
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('subscription_tier, notification_preferences')
                    .eq('id', user.id)
                    .single();

                if (profile?.subscription_tier) {
                    setSubscriptionTier(profile.subscription_tier);
                }

                // Load notification preferences if they exist
                if (profile?.notification_preferences) {
                    setNotifications(profile.notification_preferences);
                }
            }
        } catch (error) {
            logger.error('Error loading profile:', error);
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found');
            
            const updateData: any = { data: { full_name: fullName } };
            
            // Only update email if it changed
            if (email !== user.email) {
                updateData.email = email;
            }
            
            const { error } = await supabase.auth.updateUser(updateData);
            if (error) throw error;
            alert('Profile updated successfully! Please check your email if you changed it.');
            // Reload profile and notify parent
            await loadProfile();
            onProfileUpdate?.();
        } catch (error: any) {
            alert('Failed to update profile: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }
        
        if (!confirm('Are you absolutely sure? This will permanently delete your account and all data. This action cannot be undone.')) {
            setDeleteConfirm(false);
            return;
        }

        setLoading(true);
        try {
            // Call the delete-user Edge Function
            const { data, error } = await supabase.functions.invoke('delete-user', {
                method: 'POST',
            });

            if (error) throw error;
            
            alert('Account deleted. Redirecting...');
            await supabase.auth.signOut();
            window.location.href = '/';
        } catch (error: any) {
            logger.error('Delete error:', error);
            
            // Check if the error is that the Edge Function doesn't exist
            if (error?.message?.includes('Function not found') || error?.message?.includes('404')) {
                alert('Account deletion is not yet available. Please contact support to delete your account.\n\nNote: Edge Functions need to be deployed first. See DEPLOY_EDGE_FUNCTIONS.md for setup instructions.');
            } else {
                alert('Failed to delete account: ' + (error?.message || 'Unknown error'));
            }
            
            setLoading(false);
            setDeleteConfirm(false);
        }
    };

    const handleToggle = async (key: keyof typeof notifications) => {
        const newNotifications = { ...notifications, [key]: !notifications[key] };
        setNotifications(newNotifications);

        // Save to database
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('user_profiles')
                    .update({ notification_preferences: newNotifications })
                    .eq('id', user.id);

                if (error) {
                    logger.error('Error saving notification preferences:', error);
                    // Revert on error
                    setNotifications(notifications);
                }
            }
        } catch (error) {
            logger.error('Error updating notifications:', error);
            // Revert on error
            setNotifications(notifications);
        }
    };

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const priceId = STRIPE_PRICES.entrepreneur;
            const result = await createCheckoutSession(priceId);

            if (result.error) {
                alert(`Error: ${result.error}`);
            } else if (result.url) {
                // Redirect to Stripe checkout
                window.location.href = result.url;
            } else {
                alert('Error: Could not create checkout session. Please try again.');
            }
        } catch (error: any) {
            alert(`Error: ${error.message || 'Failed to start checkout'}`);
        } finally {
            setUpgrading(false);
        }
    };

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('User not authenticated');
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const functionUrl = `${supabaseUrl}/functions/v1/create-portal-session`;

            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
                },
                body: JSON.stringify({
                    returnUrl: `${window.location.origin}/dashboard?tab=settings`,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to create portal session');
            }

            if (responseData.url) {
                window.location.href = responseData.url;
            } else {
                throw new Error('No portal URL returned');
            }
        } catch (error: any) {
            alert(`Error: ${error.message || 'Failed to open subscription management. Please contact support.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-light-text mb-8">Settings</h2>
            <div className="space-y-8 max-w-3xl">
                {/* Profile Information */}
                <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-light-text mb-4">Profile Information</h3>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-medium-text mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-medium-text mb-2">Email</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"
                            />
                            <p className="text-xs text-medium-text mt-1">You'll need to verify your new email if changed.</p>
                        </div>
                        <div className="text-right">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="bg-brand-orange text-white font-bold py-2 px-5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notification Preferences */}
                <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-light-text mb-4">Notification Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-light-text">Weekly Hustle Digest</p>
                                <p className="text-sm text-medium-text">Receive a weekly email with top opportunities.</p>
                            </div>
                            <button onClick={() => handleToggle('weekly')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${notifications.weekly ? 'bg-brand-orange' : 'bg-dark-bg'}`}>
                                <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.weekly ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-light-text">Product Updates</p>
                                <p className="text-sm text-medium-text">Get notified about new features and updates.</p>
                            </div>
                             <button onClick={() => handleToggle('product')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${notifications.product ? 'bg-brand-orange' : 'bg-dark-bg'}`}>
                                <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.product ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                             <div>
                                <p className="font-medium text-light-text">Special Offers</p>
                                <p className="text-sm text-medium-text">Receive promotional offers from Nectar Forge and partners.</p>
                            </div>
                             <button onClick={() => handleToggle('offers')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${notifications.offers ? 'bg-brand-orange' : 'bg-dark-bg'}`}>
                                <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.offers ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subscription & Billing */}
                <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-light-text mb-4">Subscription & Billing</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-medium-text mb-2">Current Plan</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-2xl font-bold ${subscriptionTier === 'entrepreneur' ? 'text-brand-orange' : 'text-light-text'}`}>
                                        {subscriptionTier === 'entrepreneur' ? 'Entrepreneur Plan' : 'Free (Hustler) Plan'}
                                    </p>
                                    {subscriptionTier === 'entrepreneur' && (
                                        <p className="text-sm text-green-400 mt-1">Unlimited access to all features</p>
                                    )}
                                    {subscriptionTier === 'free' && (
                                        <p className="text-sm text-medium-text mt-1">Limited features • Upgrade for unlimited access</p>
                                    )}
                                </div>
                                {subscriptionTier === 'free' && (
                                    <button
                                        onClick={handleUpgrade}
                                        disabled={upgrading}
                                        className="bg-brand-orange text-white font-bold py-3 px-6 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {upgrading ? 'Starting Checkout...' : 'Upgrade Now'}
                                    </button>
                                )}
                            </div>
                        </div>
                        {subscriptionTier === 'entrepreneur' && (
                            <div className="pt-4 border-t border-dark-card-border">
                                <p className="text-sm text-medium-text mb-3">Manage your subscription</p>

                                {/* Downgrade Protection Notice */}
                                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-md mb-4">
                                    <div className="flex gap-2">
                                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-sm text-light-text">
                                            <p className="font-semibold mb-1">Important: About Downgrades</p>
                                            <p className="text-xs text-medium-text">
                                                If you downgrade or cancel, you'll keep full Entrepreneur access until the end of your current billing period.
                                                You've already paid for this month, so you won't lose any days of service. Your plan will automatically
                                                convert to the Free (Hustler) plan when your billing period ends.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <button
                                        onClick={handleManageSubscription}
                                        disabled={loading}
                                        className="text-brand-orange hover:text-brand-orange-light text-sm font-medium underline disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : 'Manage Billing & Cancel Subscription'}
                                    </button>
                                    <p className="text-xs text-medium-text">View invoices, update payment method, or cancel your subscription</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Danger Zone */}
                <div className="bg-dark-card border border-red-500/30 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-medium-text mb-4">Permanently delete your account and all of your data. This action is irreversible.</p>
                    <button 
                        onClick={handleDeleteAccount} 
                        disabled={loading}
                        className={`bg-red-600/20 text-red-400 font-bold py-2 px-5 rounded-md transition-colors ${deleteConfirm ? 'bg-red-600/40 hover:bg-red-600/60' : 'hover:bg-red-600/40'} disabled:opacity-50`}
                    >
                        {deleteConfirm ? 'Click again to confirm deletion' : loading ? 'Deleting...' : 'Delete My Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const HelpSupportContent: React.FC = () => {
    const [showGuide, setShowGuide] = useState<string | null>(null);

    const handleGuideClick = (guideType: string, e: React.MouseEvent) => {
        e.preventDefault();
        setShowGuide(guideType);
    };

    if (showGuide) {
        return (
            <div className="p-8 animate-fade-in-up">
                <button onClick={() => setShowGuide(null)} className="mb-6 flex items-center text-medium-text hover:text-light-text transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Help & Support
                </button>
                <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg max-w-4xl">
                    {showGuide === 'getting-started' && (
                        <>
                            <h2 className="text-3xl font-bold text-light-text mb-6">Getting Started with Nectar Forge</h2>
                            <div className="space-y-4 text-medium-text">
                                <p>Welcome to Nectar Forge! Here's everything you need to know to get started on your side hustle journey.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">Step 1: Complete Your Profile</h3>
                                <p>Tell us about your skills, interests, and financial goals. The more details you provide, the better our AI can match you with opportunities.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">Step 2: Explore Your Matches</h3>
                                <p>Browse personalized side hustle recommendations tailored to your profile. Each opportunity includes detailed information about profit potential, time commitment, and required skills.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">Step 3: Save and Track</h3>
                                <p>Save interesting opportunities to your "My Hustles" section and track your progress as you build your income streams.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">Step 4: Engage with Community</h3>
                                <p>Join discussions, read success stories, and connect with fellow hustlers for support and inspiration.</p>
                            </div>
                        </>
                    )}
                    {showGuide === 'vetting' && (
                        <>
                            <h2 className="text-3xl font-bold text-light-text mb-6">How to Vet a Side Hustle</h2>
                            <div className="space-y-4 text-medium-text">
                                <p>Before diving into any side hustle, it's crucial to evaluate it carefully. Here's our proven framework:</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">1. Profit Potential</h3>
                                <p>Look for realistic income projections. Check if similar hustles in your area are generating the promised returns. Avoid get-rich-quick schemes.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">2. Upfront Investment</h3>
                                <p>Calculate the total cost to get started: equipment, supplies, subscriptions, training, etc. Ensure you can afford the initial investment.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">3. Time Commitment</h3>
                                <p>Be honest about how much time you can realistically dedicate. Will you be able to sustain this alongside your main commitments?</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">4. Skill Requirements</h3>
                                <p>Assess if you already have the necessary skills or if the learning curve is manageable. Factor in time and cost for skill development.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">5. Market Demand</h3>
                                <p>Research if there's actual demand for this service or product in your area or online. Check competitor saturation.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">6. Growth Opportunities</h3>
                                <p>Consider whether this can scale or if it's a one-time gig. Think about long-term sustainability and potential expansion.</p>
                                <h3 className="text-xl font-bold text-light-text mt-6 mb-3">7. Red Flags to Watch</h3>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Requires large upfront payment</li>
                                    <li>Promises unrealistic returns</li>
                                    <li>Pressure to act immediately</li>
                                    <li>Vague about the actual work involved</li>
                                    <li>Limited online presence or reviews</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-light-text mb-8">Help & Support</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     {/* Re-using the FAQ component here */}
                     <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                         <h3 className="text-xl font-bold text-light-text mb-4">Frequently Asked Questions</h3>
                         <FAQ />
                     </div>
                </div>
                <div className="space-y-8">
                     <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-light-text mb-4">Contact Us</h3>
                        <p className="text-medium-text mb-4">Can't find an answer? Our team is here to help.</p>
                        <a href="mailto:contact@nectarforge.app?subject=Support%20Request" className="inline-block w-full text-center bg-brand-orange text-white font-bold py-3 px-5 rounded-md hover:opacity-90 transition-opacity">
                            Email Support
                        </a>
                     </div>
                     <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-light-text mb-4">Guides & Tutorials</h3>
                        <ul className="space-y-3">
                            <li><button onClick={(e) => handleGuideClick('getting-started', e)} className="flex items-center w-full text-left text-medium-text hover:text-brand-orange-light transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Getting Started with Nectar Forge</button></li>
                            <li><button onClick={(e) => handleGuideClick('vetting', e)} className="flex items-center w-full text-left text-medium-text hover:text-brand-orange-light transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>How to Vet a Side Hustle</button></li>
                        </ul>
                     </div>
                </div>
            </div>
        </div>
    );
};

const CommunityContent: React.FC = () => {
    return (
        <div className="p-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-light-text mb-6">Community</h2>
            <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg text-center">
                <p className="text-xl text-medium-text mb-4">Community features coming soon!</p>
                <p className="text-medium-text">Connect with other hustlers, share your success stories, and learn from the community.</p>
            </div>
        </div>
    );
};

const PlaceholderContent: React.FC<{title: string}> = ({title}) => (
    <div className="p-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-light-text mb-6">{title}</h2>
        <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
            <p className="text-medium-text">Content for {title.toLowerCase()} will be here.</p>
        </div>
    </div>
);


interface DashboardProps {
  onLogout: () => void;
  onNavigateToHome?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigateToHome }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userName, setUserName] = useState('User');
  const [, setRefreshKey] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  useEffect(() => {
    // Load user name on mount
    loadUserName();
  }, []);

  // Handle successful payment redirect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('success') === 'true') {
      setIsVerifyingPayment(true);

      // Wait a moment for webhook to process, then check subscription status
      setTimeout(async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('subscription_tier')
              .eq('id', user.id)
              .single();

            if (profile?.subscription_tier === 'entrepreneur') {
              // Success! Subscription has been upgraded
              setShowSuccessMessage(true);
              // Hide success message after 10 seconds
              setTimeout(() => setShowSuccessMessage(false), 10000);
            } else {
              // Webhook might still be processing
              setShowPendingMessage(true);
              // Hide pending message after 15 seconds
              setTimeout(() => setShowPendingMessage(false), 15000);
            }
          }
        } catch (error) {
          logger.error('Error verifying payment:', error);
        } finally {
          setIsVerifyingPayment(false);
          // Clean up URL
          window.history.replaceState({}, '', '/dashboard');
        }
      }, 2000); // Wait 2 seconds for webhook to process
    }
  }, []);

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        setUserName(name);
      }
    } catch (error) {
      logger.error('Error loading user name:', error);
    }
  };

  const handleProfileUpdate = async () => {
    await loadUserName();
    setRefreshKey(prev => prev + 1); // Force re-render
  };

  const handleNavigateHome = () => {
    // Navigate to main homepage, stay logged in
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };
  
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'find':
        return <div className="p-8"><DashboardDemo onSignUpClick={() => alert('To get unlimited matches, please upgrade to the Entrepreneur plan in Settings or contact support.')} /></div>; 
      case 'myhustles':
        return <MyHustles />;
      case 'community':
        return <CommunityContent />;
      case 'pricing':
        return <div className="p-8"><Pricing /></div>;
      case 'settings':
        return <SettingsContent onProfileUpdate={handleProfileUpdate} />;
      case 'help':
        return <HelpSupportContent />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-light-text">
      <Sidebar activeItem={activeView} onItemClick={setActiveView} onLogoClick={handleNavigateHome} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName={userName} onLogout={onLogout} />
        {/* Add pb-20 on mobile to account for bottom navigation, md:pb-0 for desktop */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg/80 pb-20 md:pb-0">
          {renderContent()}
        </main>
      </div>

      {/* Payment Verification Loading */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-dark-card border border-dark-card-border rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
              <div>
                <h3 className="text-lg font-bold text-light-text">Verifying Payment</h3>
                <p className="text-medium-text text-sm">Please wait while we confirm your upgrade...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-up max-w-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h4 className="font-bold">Upgrade Successful!</h4>
              <p className="text-sm mt-1">Welcome to the Entrepreneur tier! You now have unlimited generations.</p>
            </div>
            <button onClick={() => setShowSuccessMessage(false)} className="ml-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pending Message */}
      {showPendingMessage && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in-up max-w-md">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <h4 className="font-bold">Payment Processing</h4>
              <p className="text-sm mt-1">Your payment is being processed. Your account will be upgraded shortly. Please refresh in a moment.</p>
            </div>
            <button onClick={() => setShowPendingMessage(false)} className="ml-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;