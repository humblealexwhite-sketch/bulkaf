import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBFBFC",
        panel: "#FFFFFF",
        panel2: "#EEF0F3",
        line: "#E8EAEE",
        accent: "#2E93E0",
        accent2: "#14181F",
        text: "#14181F",
        muted: "#9AA2B1",
        ok: "#22A559",
        warn: "#E24B4A",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
