import React from 'react';

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, onLogout }) => {
  return (
    <header className="flex justify-between items-center p-6 border-b border-dark-card-border">
      <div>
        <h1 className="text-2xl font-bold text-light-text">Welcome back, {userName}!</h1>
        <p className="text-medium-text">Here's your snapshot of your side hustle journey.</p>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-medium-text hover:text-light-text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange-light"></span>
            </span>
        </button>
        <div className="flex items-center space-x-3">
          <img className="w-10 h-10 rounded-full object-cover" src={`https://api.dicebear.com/8.x/initials/svg?seed=${userName}`} alt={userName} />
          <div>
            <p className="font-semibold text-light-text">{userName}</p>
            <button onClick={onLogout} className="text-sm text-medium-text hover:text-brand-orange-light">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
