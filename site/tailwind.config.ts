import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1320px",
      },
    },
    extend: {
      colors: {
        // Escala "brand" derivada da cor principal da marca Glitch
        // (#670001, vinho escuro). Nenhum componente escreve #670001
        // diretamente — sempre via este token ou via `wine`/`ink`/`bone`
        // abaixo. Ver rules/04-tailwind-styling-conventions.md.
        brand: {
          50: "#fdf2f2",
          100: "#fce0e0",
          200: "#f7bcbc",
          300: "#ef8e8e",
          400: "#e35f5f",
          500: "#8f0102", // wine-bright — hover/destaque
          600: "#670001", // wine — cor principal da marca
          700: "#4d0001",
          800: "#3d0001", // wine-deep
          900: "#2a0001",
          950: "#170001",
        },
        // Tokens nomeados da identidade Glitch (Fase 4), lidos das CSS vars
        // definidas em app/globals.css. Use estes nomes nos efeitos visuais
        // (GlitchText, BlackSheep, MusicPlayer) em vez de `brand-*`.
        wine: {
          DEFAULT: "var(--glitch-wine)",
          bright: "var(--glitch-wine-bright)",
          deep: "var(--glitch-wine-deep)",
        },
        ink: "var(--glitch-ink)",
        bone: "var(--glitch-bone)",
        "glitch-cyan": "var(--glitch-cyan)",
        "glitch-magenta": "var(--glitch-magenta)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at top, rgba(53, 99, 255, 0.25), transparent 60%)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out both",
        "fade-in": "fadeIn 0.8s ease-out both",
        "blob": "blob 12s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        blob: {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -40px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
