/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        'primary': "#033555",
        'secondary': "#828282",
        'thrid': "#70CEAF",
        'fontColor': "#242526",
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out forwards",
        "zoom-in": "zoomIn 1.5s ease-out forwards",
        "slide-up": "slideUp 1s ease-out forwards",
        "bounce-in": "bounceIn 1s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        zoomIn: {
          "0%": { opacity: "0", transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
