import { Variants } from "framer-motion";

/**
 * Ring animation configuration for portal entrance
 * Creates layered, staggered ring animations
 */

// Individual ring animation
export const ringAnimationVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
    },
  },
  exit: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: [0.65, 0, 0.35, 1],
    },
  },
};

// Container for multiple rings with stagger
export const ringContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1,
    },
  },
};

// Pulse animation for ring glow
export const ringPulseVariants: Variants = {
  idle: {
    boxShadow: "0 0 20px rgba(167, 29, 42, 0.4)",
  },
  pulse: {
    boxShadow: [
      "0 0 20px rgba(167, 29, 42, 0.4)",
      "0 0 40px rgba(167, 29, 42, 0.8)",
      "0 0 20px rgba(167, 29, 42, 0.4)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};
