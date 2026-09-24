import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-space)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        ink: "#11131A",
        muted: "#6B7280",
        line: "#E9EAF0",
        cloud: "#F7F8FB",
        violet: "#6D5DFB",
        aqua: "#16C7B7",
        coral: "#FF6B5F",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(17,19,26,.08)",
        glow: "0 12px 40px rgba(109,93,251,.20)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        enter: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(.99)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        pulseSoft: { "0%,100%": { opacity: ".5" }, "50%": { opacity: "1" } },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        enter: "enter .45s cubic-bezier(.22,1,.36,1) both",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
