/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#c5a159",
        "background-light": "#f8f7f6",
        "background-dark": "#121212",
        "surface-dark": "#1C1C1E",
        "crimson": "#8B0000",
      },
      fontFamily: {
        "display": ["Sora", "Inter", "sans-serif"],
        "body": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
