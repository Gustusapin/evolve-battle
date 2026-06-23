/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Fundo: quase-preto azulado, não preto puro (mais elegante, menos "OLED genérico")
        base: {
          950: "#0A0A0F",
          900: "#13131A",
          800: "#1C1C26",
          700: "#27272F",
        },
        // Jogador 1 — violeta neon
        player1: {
          DEFAULT: "#A855F7",
          dim: "#7C3AED",
          glow: "rgba(168, 85, 247, 0.35)",
        },
        // Jogador 2 — verde-ciano neon
        player2: {
          DEFAULT: "#06FFA5",
          dim: "#04C97F",
          glow: "rgba(6, 255, 165, 0.35)",
        },
        alert: {
          DEFAULT: "#FF2D55",
          glow: "rgba(255, 45, 85, 0.35)",
        },
        ink: {
          primary: "#E4E4E7",
          secondary: "#A1A1AA",
          muted: "#5C5C66",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        soft: "1.25rem",
        card: "1.5rem",
      },
      boxShadow: {
        "glow-p1": "0 0 24px 0 rgba(168, 85, 247, 0.25)",
        "glow-p2": "0 0 24px 0 rgba(6, 255, 165, 0.25)",
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      backdropBlur: {
        glass: "16px",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
        "count-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "count-pop": "count-pop 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
