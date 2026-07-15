export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#EEF2FF",
          100: "#E0E7FF",
          600: "#4F46E5",
          700: "#4338CA",
        },
      },
    },
  },
  plugins: [],
};
