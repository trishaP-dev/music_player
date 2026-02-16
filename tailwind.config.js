/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
module.exports = {
content: ["./index.html", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        bg: '#18181b',
        primary: '#f97316',
        site_text: '#fafafa',
        muted: '#71717a'
      }
    },
  },
  plugins: [],
}

