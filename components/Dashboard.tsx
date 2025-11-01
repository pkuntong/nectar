import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import DashboardDemo from './DashboardDemo';
import FAQ from './FAQ'; // Import the FAQ component

const DashboardHome: React.FC = () => (
    <div className="p-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-light-text mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-medium-text font-semibold">Total Earnings (Mock)</h3>
                <p className="text-3xl font-bold text-light-text mt-2">$1,234.56</p>
                <p className="text-sm text-green-400 mt-1">+12.5% this month</p>
            </div>
            <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-medium-text font-semibold">Active Hustles</h3>
                <p className="text-3xl font-bold text-light-text mt-2">3</p>
                <p className="text-sm text-medium-text mt-1">2 Active, 1 Planned</p>
            </div>
            <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                <h3 className="text-medium-text font-semibold">New Opportunities</h3>
                <p className="text-3xl font-bold text-light-text mt-2">8</p>
                <p className="text-sm text-medium-text mt-1">Based on your new skills</p>
            </div>
        </div>
        <div className="mt-8 bg-dark-card border border-dark-card-border p-6 rounded-lg">
            <h3 className="text-xl font-bold text-light-text mb-4">Your Recent Activity</h3>
            <p className="text-medium-text">Activity feed will be shown here.</p>
        </div>
    </div>
);

const MyHustles: React.FC = () => {
    const [savedHustles, setSavedHustles] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('nectar_saved_hustles');
        if (saved) {
            try {
                const savedArray = JSON.parse(saved);
                setSavedHustles(savedArray);
            } catch (e) {
                console.error('Error loading saved hustles:', e);
            }
        }
    }, []);

    const handleRemove = (hustleName: string) => {
        const updated = savedHustles.filter(name => name !== hustleName);
        setSavedHustles(updated);
        localStorage.setItem('nectar_saved_hustles', JSON.stringify(updated));
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
                {savedHustles.map((hustleName, index) => (
                    <div key={index} className="bg-dark-card border border-dark-card-border p-6 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-light-text">{hustleName}</h3>
                            <p className="text-medium-text mt-2">Saved hustle opportunity</p>
                        </div>
                        <button 
                            onClick={() => handleRemove(hustleName)}
                            className="text-red-400 hover:text-red-500 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsContent: React.FC<{ onProfileUpdate?: () => void }> = ({ onProfileUpdate }) => {
    const [notifications, setNotifications] = useState({ weekly: true, product: false, offers: true });
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

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
            }
        } catch (error) {
            console.error('Error loading profile:', error);
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
            console.error('Delete error:', error);
            
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

    const handleToggle = (key: keyof typeof notifications) => {
        setNotifications(prev => ({...prev, [key]: !prev[key]}));
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
                                <p className="text-sm text-medium-text">Receive promotional offers from Nectar and partners.</p>
                            </div>
                             <button onClick={() => handleToggle('offers')} className={`w-12 h-6 rounded-full flex items-center transition-colors ${notifications.offers ? 'bg-brand-orange' : 'bg-dark-bg'}`}>
                                <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${notifications.offers ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
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
                            <h2 className="text-3xl font-bold text-light-text mb-6">Getting Started with Nectar</h2>
                            <div className="space-y-4 text-medium-text">
                                <p>Welcome to Nectar! Here's everything you need to know to get started on your side hustle journey.</p>
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
                        <a href="mailto:support@nectar.ai" className="inline-block w-full text-center bg-brand-orange text-white font-bold py-3 px-5 rounded-md hover:opacity-90 transition-opacity">
                            Email Support
                        </a>
                     </div>
                     <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-light-text mb-4">Guides & Tutorials</h3>
                        <ul className="space-y-3">
                            <li><button onClick={(e) => handleGuideClick('getting-started', e)} className="flex items-center w-full text-left text-medium-text hover:text-brand-orange-light transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Getting Started with Nectar</button></li>
                            <li><button onClick={(e) => handleGuideClick('vetting', e)} className="flex items-center w-full text-left text-medium-text hover:text-brand-orange-light transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>How to Vet a Side Hustle</button></li>
                        </ul>
                     </div>
                </div>
            </div>
        </div>
    );
};

const CommunityContent: React.FC = () => {
    const [view, setView] = useState('main');
    const [selectedStory, setSelectedStory] = useState<number | null>(null);

    const handleLinkClick = (type: string) => {
        setView(type.toLowerCase().replace(/\s+/g, '-')); // Convert to kebab-case
    };

    // Success Stories data
    const successStories = [
        {
            id: 1,
            name: "Sarah Chen",
            hustle: "Freelance Graphic Design",
            location: "San Francisco, CA",
            image: "🎨",
            timeline: "Started 6 months ago",
            earnings: "$8,500/month",
            quote: "Nectar helped me turn my passion for design into a profitable side business. I'm now making more from freelancing than my full-time job!",
            journey: [
                "Started with 0 clients, built portfolio through Nectar recommendations",
                "Focused on logo design and brand identity for small businesses",
                "Gradually increased rates as demand grew",
                "Now working with 15+ recurring clients"
            ]
        },
        {
            id: 2,
            name: "Marcus Johnson",
            hustle: "Dropshipping Business",
            location: "Austin, TX",
            image: "📦",
            timeline: "Started 4 months ago",
            earnings: "$12,000/month",
            quote: "The resources on Nectar gave me the confidence to start. I scaled from $0 to $12k in just 4 months!",
            journey: [
                "Found niche in eco-friendly home products",
                "Started with $500 initial investment",
                "Used Facebook and Instagram ads for marketing",
                "Expanded to three product lines"
            ]
        },
        {
            id: 3,
            name: "Priya Patel",
            hustle: "Online Tutoring",
            location: "New York, NY",
            image: "📚",
            timeline: "Started 8 months ago",
            earnings: "$6,200/month",
            quote: "Teaching online gives me flexibility to travel while earning. Nectar's guides helped me set up everything perfectly.",
            journey: [
                "Specialized in SAT/ACT prep for high schoolers",
                "Started with 3 students via referrals",
                "Built online course library",
                "Now teaching 25+ students weekly"
            ]
        },
        {
            id: 4,
            name: "David Kim",
            hustle: "Voiceover Services",
            location: "Los Angeles, CA",
            image: "🎤",
            timeline: "Started 1 year ago",
            earnings: "$15,000/month",
            quote: "Nectar's challenge pushed me to start. I never thought my voice could be worth this much!",
            journey: [
                "Invested in home studio setup ($2,000)",
                "Created demo reels for different industries",
                "Joined Fiverr and Voice123 platforms",
                "Now booked 2-3 weeks in advance"
            ]
        }
    ];

    // Main community view
    if (view === 'main') {
        return (
            <div className="p-8 animate-fade-in-up">
                <h2 className="text-3xl font-bold text-light-text mb-6">Community</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer" onClick={() => handleLinkClick('Success Stories')}>
                        <h3 className="text-xl font-bold text-light-text mb-3">Success Stories</h3>
                        <p className="text-medium-text mb-4">Read about how others built successful side hustles with Nectar.</p>
                        <button className="text-brand-orange-light hover:underline font-medium">View Stories →</button>
                    </div>
                    <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer" onClick={() => handleLinkClick('Discussion Forum')}>
                        <h3 className="text-xl font-bold text-light-text mb-3">Discussion Forum</h3>
                        <p className="text-medium-text mb-4">Connect with fellow hustlers and share tips.</p>
                        <button className="text-brand-orange-light hover:underline font-medium">Join Discussion →</button>
                    </div>
                    <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer" onClick={() => handleLinkClick('Weekly Challenge')}>
                        <h3 className="text-xl font-bold text-light-text mb-3">Weekly Challenge</h3>
                        <p className="text-medium-text mb-4">Participate in our weekly side hustle challenges.</p>
                        <button className="text-brand-orange-light hover:underline font-medium">See Challenge →</button>
                    </div>
                    <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer" onClick={() => handleLinkClick('Resource Library')}>
                        <h3 className="text-xl font-bold text-light-text mb-3">Resource Library</h3>
                        <p className="text-medium-text mb-4">Access free guides and templates.</p>
                        <button className="text-brand-orange-light hover:underline font-medium">Browse Resources →</button>
                    </div>
                    <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer" onClick={() => handleLinkClick('Expert Office Hours')}>
                        <h3 className="text-xl font-bold text-light-text mb-3">Expert Office Hours</h3>
                        <p className="text-medium-text mb-4">Book time with side hustle experts.</p>
                        <button className="text-brand-orange-light hover:underline font-medium">Schedule Call →</button>
                    </div>
                    <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer" onClick={() => handleLinkClick('Networking Events')}>
                        <h3 className="text-xl font-bold text-light-text mb-3">Networking Events</h3>
                        <p className="text-medium-text mb-4">Join virtual and in-person meetups.</p>
                        <button className="text-brand-orange-light hover:underline font-medium">View Events →</button>
                    </div>
                </div>
            </div>
        );
    }

    // Success Stories detailed view
    if (view === 'success-stories') {
        if (selectedStory !== null) {
            const story = successStories[selectedStory];
            return (
                <div className="p-8 animate-fade-in-up">
                    <button onClick={() => setSelectedStory(null)} className="mb-6 flex items-center text-medium-text hover:text-light-text transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Stories
                    </button>
                    
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg mb-6">
                            <div className="text-6xl mb-4">{story.image}</div>
                            <h2 className="text-3xl font-bold text-light-text mb-2">{story.name}</h2>
                            <p className="text-xl text-medium-text mb-4">{story.hustle}</p>
                            <div className="flex items-center space-x-4 text-medium-text mb-6">
                                <span className="flex items-center">
                                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {story.location}
                                </span>
                                <span>•</span>
                                <span>{story.timeline}</span>
                            </div>
                            
                            <div className="bg-brand-orange/10 border border-brand-orange/30 p-6 rounded-lg mb-6">
                                <p className="text-light-text text-lg italic mb-4">"{story.quote}"</p>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-medium-text">Monthly Earnings</p>
                                        <p className="text-2xl font-bold text-brand-orange">{story.earnings}</p>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-light-text mb-4">The Journey</h3>
                            <div className="space-y-4">
                                {story.journey.map((step, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold mr-4">
                                            {index + 1}
                                        </div>
                                        <p className="text-medium-text flex-1 pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-8 animate-fade-in-up">
                <button onClick={() => setView('main')} className="mb-6 flex items-center text-medium-text hover:text-light-text transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Community
                </button>

                <h2 className="text-3xl font-bold text-light-text mb-6">Success Stories</h2>
                <p className="text-lg text-medium-text mb-8">Get inspired by real stories from Nectar users who turned their side hustles into success.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {successStories.map((story) => (
                        <div 
                            key={story.id} 
                            className="bg-dark-card border border-dark-card-border p-6 rounded-lg hover:border-brand-orange transition-colors cursor-pointer"
                            onClick={() => setSelectedStory(story.id - 1)}
                        >
                            <div className="text-5xl mb-4">{story.image}</div>
                            <h3 className="text-xl font-bold text-light-text mb-2">{story.name}</h3>
                            <p className="text-medium-text mb-4">{story.hustle}</p>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-medium-text">{story.timeline}</span>
                                <span className="text-lg font-bold text-brand-orange">{story.earnings}</span>
                            </div>
                            <p className="text-medium-text italic mb-4">"{story.quote.substring(0, 100)}..."</p>
                            <button className="text-brand-orange-light hover:underline font-medium">Read Full Story →</button>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // All other views will show "coming soon" style pages
    const viewTitles: {[key: string]: string} = {
        'discussion-forum': 'Discussion Forum',
        'weekly-challenge': 'Weekly Challenge',
        'resource-library': 'Resource Library',
        'expert-office-hours': 'Expert Office Hours',
        'networking-events': 'Networking Events'
    };

    return (
        <div className="p-8 animate-fade-in-up">
            <button onClick={() => setView('main')} className="mb-6 flex items-center text-medium-text hover:text-light-text transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Community
            </button>

            <h2 className="text-3xl font-bold text-light-text mb-6">{viewTitles[view] || 'Community'}</h2>
            <div className="bg-dark-card border border-dark-card-border p-8 rounded-lg">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚧</div>
                    <h3 className="text-2xl font-bold text-light-text mb-4">Coming Soon!</h3>
                    <p className="text-medium-text mb-6">
                        We're working hard to bring you amazing community features. This section will be available in a future update.
                    </p>
                    <p className="text-sm text-medium-text">Check back soon for updates!</p>
                </div>
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

  useEffect(() => {
    // Load user name on mount
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        setUserName(name);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg/80">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;