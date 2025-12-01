// Theme constants
export const COLORS = {
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
} as const;

export const TYPOGRAPHY = {
  display1: { size: "4rem", lineHeight: "1.1" },
  display2: { size: "3rem", lineHeight: "1.15" },
  heading1: { size: "2.5rem", lineHeight: "1.2" },
  heading2: { size: "2rem", lineHeight: "1.25" },
  heading3: { size: "1.5rem", lineHeight: "1.3" },
  body: { size: "1rem", lineHeight: "1.6" },
} as const;
