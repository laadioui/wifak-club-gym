export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        carbon: '#08090b',
        steel: '#181b20',
        danger: '#e50914',
      },
      boxShadow: {
        glow: '0 18px 70px rgba(229, 9, 20, 0.22)',
      },
    },
  },
  plugins: [],
};
