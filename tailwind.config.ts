import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        omega: {
          beige: '#F8F3EA',
          lavender: '#F0EAF7',
          lilac: '#D9C9EE',
          purple: '#513B70',
          plum: '#806A9B',
          seafoam: '#A7DCD0',
          ink: '#30283B',
          slate: '#746D7D',
          white: '#FFFCF8',
        },
      },
      boxShadow: {
        soft: '0 12px 40px rgba(81, 59, 112, 0.10)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
