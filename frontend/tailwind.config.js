export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#f0f4ff",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
    },
  },
  plugins: [],
};
