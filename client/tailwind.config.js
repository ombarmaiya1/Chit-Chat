/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chat: {
          bg: "#05040a",
          surface: "rgba(18, 14, 34, 0.75)",
          card: "rgba(25, 20, 48, 0.55)",
          border: "rgba(255, 255, 255, 0.08)",
          primary: "#936EFF",
          purpleDark: "#7D36FE",
          purpleLight: "#C263FE",
          online: "#22c55e",
          offline: "#9ca3af",
          input: "rgba(29, 23, 56, 0.7)",
          bubbleLeft: "rgba(32, 26, 62, 0.8)",
          bubbleRight: "rgba(50, 32, 95, 0.85)",
        }
      },
      fontFamily: {
        sans: ['"Outfit"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 50px -10px rgba(147, 110, 255, 0.35)',
        'glow-sm': '0 0 20px -5px rgba(194, 99, 254, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
};
