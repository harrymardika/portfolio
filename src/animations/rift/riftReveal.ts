import { Variants } from "framer-motion";

// Rift reveal animation with clipPath polygon morphing
export const riftRevealVariants: Variants = {
  hidden: {
    clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1], // revealEase
      clipPath: {
        duration: 0.8,
        ease: [0.65, 0, 0.35, 1],
      },
    },
  },
};

// Fractal tearing effect - staggered reveal from center
export const riftFragmentVariants: Variants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
    pathOffset: 1,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

// Glow edge animation
export const riftGlowVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: [0, 1, 0.6],
    scale: [0.8, 1.2, 1],
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  pulse: {
    opacity: [0.6, 0.9, 0.6],
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Container animation for project node
export const projectNodeVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.2,
    },
  },
};
