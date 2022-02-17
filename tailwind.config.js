const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: "#3E5C76",
            },
          },
        },
      },
    },
    colors: {
      rose: colors.rose,
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      gray: colors.trueGray,
      indigo: colors.indigo,
      red: colors.rose,
      yellow: colors.amber,
      green: colors.emerald,
      purple: colors.violet,
      pink: colors.pink,
      blue: colors.blue,
    },
    fontFamily: {
      sora: ["Sora", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
      spartan: ["Spartan", "sans-serif"],
    },
  },
  variants: {
    extend: {},
    animation: ["responsive", "motion-safe", "motion-reduce"],
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};
