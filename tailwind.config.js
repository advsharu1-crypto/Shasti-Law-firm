/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./dist/**/*.html', './src/site.js'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#0B1325', 900: '#101C35', 800: '#182949', 700: '#243B64', 600: '#2E4C80' },
        gold: { 300: '#F0D478', 400: '#DFBA47', 500: '#C9A227', 600: '#AA8518', 700: '#8A6A0F' },
        ivory: { 50: '#FDFCF9', 100: '#F8F7F4', 200: '#EFECE6' },
        charcoal: { 900: '#1A1A1A', 800: '#242424', 700: '#3D3D3D', 600: '#525252' },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
