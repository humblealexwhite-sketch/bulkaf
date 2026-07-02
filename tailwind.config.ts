import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#121110",
        panel: "#1C1A18",
        panel2: "#211E1B",
        line: "#332E29",
        accent: "#FF3D1A",
        accent2: "#FFC700",
        text: "#F5F1EA",
        muted: "#8A8580",
        ok: "#A8C97F",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-worksans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
