/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto-sans-jp': ['"Noto Sans JP"', 'sans-serif'],
        'jersey25': ['"Jersey 25"', 'sans-serif'],
        'jersey10': ['"Jersey 10"', 'sans-serif'],
        'jacquarda-bastarda-9': ['"Jacquarda Bastarda 9"', 'serif'],
        'calendar-numerals': ['CalendarNumerals', 'sans-serif'],
        'silkscreen': ['Silkscreen', 'monospace'],
      },
    },
  },
  plugins: [],
}

