/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood:    { DEFAULT: "#C4A882", dark: "#8B6F4E" },
        cream:   "#F7F4EF",
        sand:    "#E8E2D9",
        charcoal:"#2C2925",
        stone:   { DEFAULT: "#6B6560", light: "#A09A94" },
        ocean:   { DEFAULT: "#1B4F72", mid: "#2E86AB", light: "#D6EAF8" },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Georgia", "serif"],
        sans:  ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
