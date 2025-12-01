import { Variants } from "framer-motion";

// Portal entrance animation
export const portalEntranceVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1], // portalEase
      staggerChildren: 0.15,
    },
  },
};

// Portal idle pulse animation
export const portalPulseVariants: Variants = {
  idle: {
    scale: 1,
    opacity: 0.8,
  },
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 3,
      ease: [0.22, 1, 0.36, 1],
      repeat: Infinity,
    },
  },
};

// Portal exit animation (transition to timeline)
export const portalExitVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  exit: {
    scale: 2.5,
    opacity: 0,
    transition: {
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1], // revealEase
    },
  },
};

// Content fade-in variants
export const contentVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.5,
    },
  },
};

// CTA button variants
export const ctaVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: 1.2,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.3,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Scroll indicator variants
export const scrollIndicatorVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      delay: 1.8,
    },
  },
  animate: {
    y: [0, 8, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Ring-specific variants for staggered entrance
export const ringVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
