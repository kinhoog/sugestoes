import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9ff',
          100: '#e6f3ff',
          200: '#c2e4ff',
          300: '#8bd0ff',
          400: '#4ab5fb',
          500: '#2497e3',
          600: '#1578c2',
          700: '#125f9d',
          800: '#124f82',
          900: '#15436b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif']
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
