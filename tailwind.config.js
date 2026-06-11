/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0A0A0F',
          surface: '#111118',
          elevated: '#1A1A25',
        },
        accent: {
          DEFAULT: '#6C3EFF',
          light: '#9D6FFF',
          muted: '#3D2299',
        },
        text: {
          DEFAULT: '#FFFFFF',
          secondary: '#8B8B9A',
          muted: '#4A4A5A',
        },
        difficulty: {
          easy: '#22D3A5',
          moderate: '#F59E0B',
          hard: '#FF3B6E',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
