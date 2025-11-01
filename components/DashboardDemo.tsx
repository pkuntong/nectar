import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

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

interface DashboardDemoProps {
  onSignUpClick: () => void;
}

const DashboardDemo: React.FC<DashboardDemoProps> = ({ onSignUpClick }) => {
  const [interest, setInterest] = useState('Creative & Design');
  const [budget, setBudget] = useState('Almost Zero ($0-$50)');
  const [time, setTime] = useState('Minimal (1-3 hours)');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Hustle[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedHustles, setSavedHustles] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load saved hustles from localStorage on mount
    const saved = localStorage.getItem('nectar_saved_hustles');
    if (saved) {
      try {
        const savedArray = JSON.parse(saved);
        setSavedHustles(new Set(savedArray));
      } catch (e) {
        console.error('Error loading saved hustles:', e);
      }
    }
  }, []);

  const handleSaveHustle = (hustle: Hustle) => {
    const saved = new Set(savedHustles);
    if (saved.has(hustle.hustleName)) {
      saved.delete(hustle.hustleName);
      alert(`${hustle.hustleName} removed from saved hustles`);
    } else {
      saved.add(hustle.hustleName);
      alert(`${hustle.hustleName} saved! View it in "My Hustles".`);
    }
    setSavedHustles(saved);
    localStorage.setItem('nectar_saved_hustles', JSON.stringify(Array.from(saved)));
  };

  const handleCopyToClipboard = (hustle: Hustle, index: number) => {
    const textToCopy = `
Hustle Name: ${hustle.hustleName}
Description: ${hustle.description}
Estimated Profit: ${hustle.estimatedProfit}
Upfront Cost: ${hustle.upfrontCost}
Time Commitment: ${hustle.timeCommitment}
Required Skills: ${hustle.requiredSkills.join(', ')}
Potential Challenges: ${hustle.potentialChallenges}
Learn More: ${hustle.learnMoreLink}
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
        setCopiedIndex(index);
        setTimeout(() => {
            setCopiedIndex(null);
        }, 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        setError("Could not copy to clipboard.");
    });
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      "Hustle Name",
      "Description",
      "Estimated Profit",
      "Upfront Cost",
      "Time Commitment",
      "Required Skills",
      "Potential Challenges",
      "Learn More Link"
    ];

    const escapeCSV = (field: string) => `"${field.replace(/"/g, '""')}"`;

    const csvRows = [
      headers.join(','),
      ...results.map(hustle => [
        escapeCSV(hustle.hustleName),
        escapeCSV(hustle.description),
        escapeCSV(hustle.estimatedProfit),
        escapeCSV(hustle.upfrontCost),
        escapeCSV(hustle.timeCommitment),
        escapeCSV(hustle.requiredSkills.join(' | ')),
        escapeCSV(hustle.potentialChallenges),
        escapeCSV(hustle.learnMoreLink)
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'nectar-hustles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Based on the following user profile, generate 3 unique and creative side hustle ideas.
      - Interest: ${interest}
      - Budget: ${budget}
      - Time per week: ${time}
      
      The ideas should be low-cost and suitable for a beginner.
      For each idea, provide a name, a short description, estimated monthly profit, estimated upfront cost, required time commitment per week, a list of 2-3 essential skills, a brief description of potential challenges a beginner might face, and a real, relevant "Learn More" URL (e.g., to a guide, platform, or resource).`;

      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            hustleName: { type: Type.STRING, description: "The name of the side hustle." },
            description: { type: Type.STRING, description: "A brief, compelling description." },
            estimatedProfit: { type: Type.STRING, description: "e.g., '$100 - $500 / month'" },
            upfrontCost: { type: Type.STRING, description: "e.g., 'Under $50'" },
            timeCommitment: { type: Type.STRING, description: "e.g., '3-5 hours / week'" },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            potentialChallenges: { type: Type.STRING, description: "A brief summary of potential challenges." },
            learnMoreLink: { type: Type.STRING, description: "A relevant URL for learning more." }
          },
          required: ["hustleName", "description", "estimatedProfit", "upfrontCost", "timeCommitment", "requiredSkills", "potentialChallenges", "learnMoreLink"]
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.8
        },
      });

      const resultText = response.text.trim();
      const generatedHustles = JSON.parse(resultText);
      setResults(generatedHustles);

    } catch (err) {
      console.error("Error generating content:", err);
      let friendlyError = "Sorry, our AI is taking a quick break. Please try again in a moment.";
      if (err instanceof Error && err.message.includes("API key")) {
          friendlyError = "The AI service is not configured correctly. Please contact support.";
      }
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-orange mx-auto"></div>
          <p className="mt-4 text-medium-text font-medium">Nectar AI is finding your opportunities...</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="text-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in-up">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 font-semibold text-red-400">Oops! Something went wrong.</p>
                <p className="mt-2 text-medium-text">{error}</p>
            </div>
        );
    }

    if (results.length > 0) {
      return (
        <div className="animate-fade-in-up">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleExportCSV}
                    className="flex items-center space-x-2 text-sm py-2 px-4 rounded-md transition-colors duration-200 border border-dark-card-border bg-dark-bg text-medium-text hover:border-light-text hover:text-light-text"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    <span>Export to CSV</span>
                </button>
            </div>
          <div className="space-y-6">
            {results.map((hustle, index) => (
              <div key={index} className="bg-dark-bg p-6 rounded-xl shadow-md border border-dark-card-border hover:shadow-brand-orange/10 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-light-text pr-4">{hustle.hustleName}</h3>
                      <div className="flex space-x-2">
                          <button
                              onClick={() => handleSaveHustle(hustle)}
                              className="flex-shrink-0 flex items-center space-x-1.5 text-sm py-1 px-3 rounded-md transition-colors duration-200 border border-dark-card-border text-medium-text hover:border-brand-orange hover:text-brand-orange-light"
                          >
                              {savedHustles.has(hustle.hustleName) ? (
                                  <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                      <span>Saved</span>
                                  </>
                              ) : (
                                  <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                      <span>Save</span>
                                  </>
                              )}
                          </button>
                          <button
                              onClick={() => handleCopyToClipboard(hustle, index)}
                              className="flex-shrink-0 flex items-center space-x-1.5 text-sm py-1 px-3 rounded-md transition-colors duration-200 border border-dark-card-border text-medium-text hover:border-light-text hover:text-light-text"
                          >
                              {copiedIndex === index ? (
                                  <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                      <span className="text-green-400 font-medium">Copied!</span>
                                  </>
                              ) : (
                                  <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                      <span>Copy</span>
                                  </>
                              )}
                          </button>
                      </div>
                  </div>
                <p className="text-medium-text mb-4">{hustle.description}</p>
                 <div className="border-t border-dark-card-border/50 my-4 py-4">
                    <h4 className="font-semibold text-medium-text text-sm mb-2">Challenges to Consider</h4>
                    <p className="text-medium-text text-sm">{hustle.potentialChallenges}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-brand-orange/10 text-brand-orange-light p-2 rounded-md text-center"><strong>Profit:</strong> {hustle.estimatedProfit}</div>
                  <div className="bg-brand-orange/10 text-brand-orange-light p-2 rounded-md text-center"><strong>Cost:</strong> {hustle.upfrontCost}</div>
                  <div className="bg-brand-orange/10 text-brand-orange-light p-2 rounded-md text-center"><strong>Time:</strong> {hustle.timeCommitment}</div>
                  <div className="bg-brand-orange/10 text-brand-orange-light p-2 rounded-md text-center"><strong>Skills:</strong> {hustle.requiredSkills.join(', ')}</div>
                </div>
                <div className="mt-4 text-right">
                    <a href={hustle.learnMoreLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-brand-orange-light hover:underline">
                        Learn More
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
              </div>
            ))}
              <div className="text-center pt-6">
                  <p className="text-lg text-light-text mb-4">Ready to unlock your full potential?</p>
                  <button 
                    onClick={onSignUpClick}
                    className="bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-8 rounded-md text-lg hover:opacity-90 transition-opacity shadow-lg shadow-brand-orange/30"
                  >
                    Sign Up and Get Unlimited Matches
                  </button>
              </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <section id="dashboard-demo" className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-light-text">See Nectar in Action</h2>
          <p className="text-lg text-medium-text mt-4">Tell us a bit about yourself and our AI will generate personalized side hustle ideas for you instantly.</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-dark-card border border-dark-card-border p-8 rounded-2xl shadow-2xl">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-medium-text mb-2">Interest</label>
              <select value={interest} onChange={(e) => setInterest(e.target.value)} className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none">
                <option>Creative & Design</option>
                <option>Technology & Coding</option>
                <option>Writing & Content</option>
                <option>E-commerce & Sales</option>
                <option>Services & Consulting</option>
                <option>Education & Tutoring</option>
                <option>Finance & Investing</option>
                <option>Health & Fitness</option>
                <option>Handmade & Crafts</option>
                <option>Events & Entertainment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-medium-text mb-2">Budget</label>
              <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none">
                <option>Almost Zero ($0-$50)</option>
                <option>Low ($50 - $250)</option>
                <option>Moderate ($250 - $1000)</option>
                <option>Flexible ($1000+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-medium-text mb-2">Time per Week</label>
              <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-3 bg-dark-bg border border-dark-card-border rounded-lg text-light-text focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none">
                <option>Minimal (1-3 hours)</option>
                <option>Part-time (5-10 hours)</option>
                <option>Significant (10-20 hours)</option>
                <option>Full-time Focus (20+ hours)</option>
              </select>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="bg-gradient-to-r from-brand-orange-light to-brand-orange text-white font-bold py-3 px-10 rounded-md text-lg hover:opacity-90 transition-all shadow-lg shadow-brand-orange/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Find My Hustle'}
            </button>
          </div>

          <div className="mt-10">
            {renderResults()}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardDemo;