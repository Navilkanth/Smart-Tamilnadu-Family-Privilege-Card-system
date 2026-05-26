/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tn: {
          green: '#0d6b3a',
          gold: '#c9a227',
          maroon: '#8b1538',
          cream: '#f7f4ed',
        },
      },
      fontFamily: {
        display: ['Arial', 'Helvetica', 'sans-serif'],
        body: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
