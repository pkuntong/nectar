import React, { useState } from 'react';
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

const MyHustles: React.FC = () => (
    <div className="p-8 animate-fade-in-up">
        <h2 className="text-3xl font-bold text-light-text mb-6">My Hustles</h2>
        <div className="bg-dark-card border border-dark-card-border p-6 rounded-lg">
            <p className="text-medium-text">A list of your saved and active side hustles will appear here.</p>
        </div>
    </div>
);

const SettingsContent: React.FC = () => {
    const [notifications, setNotifications] = useState({ weekly: true, product: false, offers: true });

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
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-medium-text mb-2">Full Name</label>
                            <input type="text" defaultValue="Alex" className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none"/>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-medium-text mb-2">Email</label>
                            <input type="email" defaultValue="alex@example.com" disabled className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-medium-text cursor-not-allowed"/>
                        </div>
                        <div className="text-right">
                            <button type="submit" className="bg-brand-orange text-white font-bold py-2 px-5 rounded-md hover:opacity-90 transition-opacity">Save Changes</button>
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
                    <button className="bg-red-600/20 text-red-400 font-bold py-2 px-5 rounded-md hover:bg-red-600/40 transition-colors">Delete My Account</button>
                </div>
            </div>
        </div>
    );
};

const HelpSupportContent: React.FC = () => (
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
                        <li><a href="#" className="flex items-center text-medium-text hover:text-brand-orange-light"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>Getting Started with Nectar</a></li>
                        <li><a href="#" className="flex items-center text-medium-text hover:text-brand-orange-light"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>How to Vet a Side Hustle</a></li>
                    </ul>
                 </div>
            </div>
        </div>
    </div>
);

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
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState('dashboard');
  
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'find':
        return <div className="p-8"><DashboardDemo onSignUpClick={() => {}} /></div>; 
      case 'myhustles':
        return <MyHustles />;
      case 'community':
        return <PlaceholderContent title="Community" />;
      case 'settings':
        return <SettingsContent />;
      case 'help':
        return <HelpSupportContent />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-light-text">
      <Sidebar activeItem={activeView} onItemClick={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userName="Alex" onLogout={onLogout} /> 
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg/80">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;