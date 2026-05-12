/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Colores institucionales Universidad de La Sabana
        'sabana-blue': '#1B2D6B',
        'sabana-blue-light': '#2A3F8F',
        'sabana-gold': '#C9A84C',
        'sabana-white': '#FFFFFF',
        'sabana-bg': '#F5F6FA',
        'sabana-border': '#D1D5DB',
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(27, 45, 107, 0.10)',
        btn: '0 2px 8px rgba(27, 45, 107, 0.15)',
      },
    },
  },
  plugins: [],
};