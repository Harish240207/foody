/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f97316",
        primaryDark: "#ea580c",
        bgSoft: "#fff7ed",
        card: "#ffffff",
        borderSoft: "#fde68a"
      },
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl2: "18px"
      }
    }
  },
  plugins: [],
}