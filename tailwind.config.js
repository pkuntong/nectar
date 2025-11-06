/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'dark-bg': '#0A0A0A',
        'dark-card': '#121212',
        'dark-card-solid': '#18181B',
        'dark-card-border': 'rgba(255, 255, 255, 0.1)',
        'light-text': '#F8FAFC',
        'medium-text': '#94A3B8',
        'brand-orange': '#EA580C',
        'brand-orange-light': '#F97316',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 15px rgba(234, 88, 12, 0.4)',
      }
    },
  },
  plugins: [],
}
