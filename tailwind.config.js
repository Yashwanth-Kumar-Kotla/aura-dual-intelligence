/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#050816",
          800: "#050b1f"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(56,189,248,0.35)"
      }
    }
  },
  plugins: []
};
