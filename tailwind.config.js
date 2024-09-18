module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "/node_modules/react-tailwindcss-select/dist/index.esm.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5b8bdf",
        secondary: "#2c64c6",
        tertiary: "#02338a",
        "primary-text": "#052152",
      },
    },
  },
  plugins: [],
};
