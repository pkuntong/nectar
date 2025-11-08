import React from 'react';

const Logo: React.FC = () => (
    <div className="flex items-center space-x-3">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear_footer_logo)"/>
      <path d="M2 17L12 22L22 17L12 12L2 17Z" fill="url(#paint1_linear_footer_logo)"/>
      <defs>
        <linearGradient id="paint0_linear_footer_logo" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316"/>
          <stop offset="1" stopColor="#EA580C"/>
        </linearGradient>
        <linearGradient id="paint1_linear_footer_logo" x1="12" y1="12" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" stopOpacity="0.7"/>
          <stop offset="1" stopColor="#EA580C" stopOpacity="0.8"/>
        </linearGradient>
      </defs>
    </svg>
    <span className="font-bold text-2xl text-light-text tracking-wide">Nectar Forge</span>
  </div>
);

interface FooterProps {
    onInfoClick: (type: 'pricing' | 'about' | 'privacy' | 'tos') => void;
}

const Footer: React.FC<FooterProps> = ({ onInfoClick }) => {
    const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleInfoClick = (e: React.MouseEvent<HTMLAnchorElement>, type: 'pricing' | 'about' | 'privacy' | 'tos') => {
        e.preventDefault();
        onInfoClick(type);
    };

    return (
        <footer className="bg-dark-bg border-t border-dark-card-border">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="col-span-1">
                        <Logo />
                        <p className="mt-6 text-medium-text leading-relaxed">AI-powered income streams. Your next side hustle awaits.</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-light-text mb-6 text-lg">Product</h3>
                        <ul className="space-y-3">
                            <li><a href="#features" onClick={(e) => handleScrollClick(e, 'features')} className="text-medium-text hover:text-brand-orange-light transition-colors duration-300 inline-block hover:translate-x-1">Features</a></li>
                            <li><a href="#" onClick={(e) => handleInfoClick(e, 'pricing')} className="text-medium-text hover:text-brand-orange-light transition-colors duration-300 inline-block hover:translate-x-1">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-light-text mb-6 text-lg">Company</h3>
                        <ul className="space-y-3">
                            <li><a href="#" onClick={(e) => handleInfoClick(e, 'about')} className="text-medium-text hover:text-brand-orange-light transition-colors duration-300 inline-block hover:translate-x-1">About Us</a></li>
                            <li>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Opens email client with pre-filled subject for privacy
                                        window.location.href = 'mailto:contact@nectarforge.app?subject=Contact%20from%20Nectar%20Forge';
                                    }}
                                    className="text-medium-text hover:text-brand-orange-light transition-colors duration-300 inline-block hover:translate-x-1"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-light-text mb-6 text-lg">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="#" onClick={(e) => handleInfoClick(e, 'privacy')} className="text-medium-text hover:text-brand-orange-light transition-colors duration-300 inline-block hover:translate-x-1">Privacy Policy</a></li>
                            <li><a href="#" onClick={(e) => handleInfoClick(e, 'tos')} className="text-medium-text hover:text-brand-orange-light transition-colors duration-300 inline-block hover:translate-x-1">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-16 border-t border-dark-card-border pt-8 text-center text-medium-text">
                    <p>&copy; {new Date().getFullYear()} Nectar Forge AI, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;