module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        primary_light: "var(--primary-light)",
        secondary: "var(--secondary)",
      },
      fontFamily: {
        ubuntu: "Ubuntu, sans-serif",
      },
      transitionProperty: {
        width: "width",
      },
    },
  },
  plugins: [],
};
