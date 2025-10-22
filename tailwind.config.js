/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#151B34',
          600: '#151B34',
          700: '#0f1426',
          800: '#0c1220',
          900: '#0a0f1c',
        },
        sidebar: {
          bg: '#151B34',
          hover: '#1e2441',
        }
      },
    },
  },
  plugins: [],
} 