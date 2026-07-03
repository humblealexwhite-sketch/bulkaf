import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0B",
        panel: "#141416",
        panel2: "#1C1C1F",
        line: "rgba(255,255,255,0.08)",
        accent: "#2E93E0",
        accent2: "#FFFFFF",
        text: "#F5F6F8",
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
