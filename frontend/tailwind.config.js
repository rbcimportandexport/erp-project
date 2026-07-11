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
          50: "#eef8ff",
          600: "#0d72b9",
          700: "#095b95",
        },
      },
    },
  },
  plugins: [],
};
