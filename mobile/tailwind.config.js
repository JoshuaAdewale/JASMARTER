/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.js', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af',
        },
      },
    },
  },
  plugins: [],
};
