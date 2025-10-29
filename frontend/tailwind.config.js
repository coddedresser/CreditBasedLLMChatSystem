/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media', // or 'class' if you want a toggle switch later
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background-rgb))',
        foreground: 'rgb(var(--foreground-rgb))',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
