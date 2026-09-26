export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        bg: "#0F1512",
        surface: "#171F1B",
        accent: "#8FBF9F",
        alert: "#D98B7A",
      },
    },
  },
  plugins: [],
};
