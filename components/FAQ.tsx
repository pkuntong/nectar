import React, { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-dark-card-border py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-lg font-medium text-light-text hover:text-brand-orange-light focus:outline-none transition-colors duration-300"
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
            <p className="pt-4 text-medium-text">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "What is Nectar?",
      answer: "Nectar is an AI-powered platform designed to help you discover personalized side hustles, freelance gigs, and micro-investment opportunities. We analyze your skills, interests, and goals to provide you with a curated list of high-potential income streams."
    },
    {
      question: "Is Nectar free to use?",
      answer: "Nectar offers a free tier that gives you access to a limited number of AI-powered recommendations per week. We also have premium plans with unlimited recommendations, advanced analytics, and direct access to exclusive opportunities."
    },
    {
      question: "How much can I realistically earn?",
      answer: "Earnings vary widely depending on the opportunity and the time you invest. Our goal is to connect you with ventures that match your income goals, from a few hundred dollars a month in passive income to full-time freelance careers."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption and follow industry best practices to ensure your personal data is always safe and secure. We will never share your data with third parties without your explicit consent."
    }
  ];

  return (
    <section className="py-20 bg-dark-bg/50">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-light-text">Frequently Asked Questions</h2>
        </div>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;