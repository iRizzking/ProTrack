/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4f9',
          100: '#dde7f3',
          200: '#c2d4e9',
          300: '#99bcdd',
          400: '#699dcd',
          500: '#4880bd',
          600: '#3466a3',
          700: '#2a5184',
          800: '#1b365d', // Navy aksen biru tua sesuai PRD
          900: '#132744',
          950: '#0c192d',
        }
      }
    },
  },
  plugins: [],
}
