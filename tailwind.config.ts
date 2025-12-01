import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Temporal Portal Color System
        maroon: {
          primary: "#6B0F1A",
          neon: "#A71D2A",
          dark: "#4A0A12",
        },
        space: {
          navy: "#080910",
          deep: "#0A0B14",
          medium: "#1A1B2E",
        },
        gold: {
          highlight: "#FFD27F",
          dim: "#E6C070",
        },
        text: {
          primary: "#E6E6EA",
          secondary: "#B8B8C0",
          muted: "#8A8A92",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      fontSize: {
        "display-1": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }], // 64px
        "display-2": ["3rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }], // 48px
        "heading-1": [
          "2.5rem",
          { lineHeight: "1.2", letterSpacing: "-0.01em" },
        ], // 40px
        "heading-2": ["2rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }], // 32px
        "heading-3": ["1.5rem", { lineHeight: "1.3" }], // 24px
        body: ["1rem", { lineHeight: "1.6" }], // 16px
        "body-sm": ["0.875rem", { lineHeight: "1.5" }], // 14px
      },
      spacing: {
        xs: "0.25rem", // 4px
        s: "0.5rem", // 8px
        m: "1rem", // 16px
        l: "1.5rem", // 24px
        xl: "2rem", // 32px
        xxl: "3rem", // 48px
        "3xl": "4rem", // 64px
        "4xl": "6rem", // 96px
      },
      animation: {
        "portal-spin": "portal-spin 20s linear infinite",
        "portal-pulse":
          "portal-pulse 3s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        "rift-reveal":
          "rift-reveal 0.5s cubic-bezier(0.65, 0, 0.35, 1) forwards",
        "modal-enter":
          "modal-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "particle-drift": "particle-drift 8s ease-in-out infinite",
        glitch: "glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      keyframes: {
        "portal-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "portal-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "0.8",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "1",
          },
        },
        "rift-reveal": {
          "0%": {
            clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
            opacity: "0",
          },
          "100%": {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            opacity: "1",
          },
        },
        "modal-enter": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "particle-drift": {
          "0%, 100%": {
            transform: "translate(0, 0)",
          },
          "25%": {
            transform: "translate(10px, -15px)",
          },
          "50%": {
            transform: "translate(-5px, -25px)",
          },
          "75%": {
            transform: "translate(-15px, -10px)",
          },
        },
        glitch: {
          "0%, 100%": {
            transform: "translate(0)",
          },
          "20%": {
            transform: "translate(-2px, 2px)",
          },
          "40%": {
            transform: "translate(-2px, -2px)",
          },
          "60%": {
            transform: "translate(2px, 2px)",
          },
          "80%": {
            transform: "translate(2px, -2px)",
          },
        },
      },
      zIndex: {
        background: "0",
        starfield: "10",
        "portal-base": "20",
        "rift-edges": "30",
        "project-nodes": "40",
        modal: "50",
        particles: "60",
      },
      backdropBlur: {
        portal: "20px",
      },
    },
  },
  plugins: [],
  safelist: [
    // Animation classes
    "animate-portal-spin",
    "animate-portal-pulse",
    "animate-rift-reveal",
    "animate-modal-enter",
    "animate-particle-drift",
    "animate-glitch",
    // Z-index utilities
    "z-background",
    "z-starfield",
    "z-portal-base",
    "z-rift-edges",
    "z-project-nodes",
    "z-modal",
    "z-particles",
  ],
} satisfies Config;
