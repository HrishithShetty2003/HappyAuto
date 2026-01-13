/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b', // Amber for Auto-rickshaw theme
          600: '#d97706',
          900: '#78350f',
        }
      }
    },
  },
  plugins: [],
}