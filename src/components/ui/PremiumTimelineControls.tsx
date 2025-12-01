/**
 * Premium Timeline Controls
 * Floating control buttons positioned in top corners with premium styling
 * - Soft neon glow edges
 * - Minimal aesthetic aligned with Time-Warp theme
 * - Responsive positioning and sizing
 * - Full accessibility support
 * - Smooth Framer Motion animations
 */

import { motion } from "framer-motion";
import { playSound } from "@/lib/sound";

interface PremiumTimelineControlsProps {
  onBackToPortal: () => void;
  onAccessibilityClick: () => void;
}

export default function PremiumTimelineControls({
  onBackToPortal,
  onAccessibilityClick,
}: PremiumTimelineControlsProps) {
  // Container animation: staggered fade-in
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  // Button animation: fade-in and scale
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const handleBackClick = () => {
    playSound("click");
    onBackToPortal();
  };

  const handleAccessibilityClick = () => {
    playSound("click");
    onAccessibilityClick();
  };

  return (
    <motion.div
      className="fixed inset-0 z-modal pointer-events-none"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Back to Portal Button - Top Left */}
      <motion.div
        className="fixed top-6 left-6 pointer-events-auto md:top-8 md:left-8"
        variants={buttonVariants}
      >
        <motion.button
          onClick={handleBackClick}
          className="relative group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Back to portal"
          title="Back to Portal (Press ESC)"
        >
          {/* Glow Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-maroon-neon/20 to-gold-highlight/10 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Soft Neon Border */}
          <div className="absolute inset-0 rounded-lg border border-maroon-neon/40 group-hover:border-maroon-neon/80 shadow-lg shadow-maroon-neon/20 transition-all duration-300" />

          {/* Button Content */}
          <div className="relative px-4 md:px-5 py-2.5 md:py-3 backdrop-blur-sm bg-space-navy/60 rounded-lg flex items-center gap-2 text-sm md:text-base font-semibold text-text-primary">
            {/* Back Arrow Icon */}
            <svg
              className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Portal</span>
          </div>

          {/* Animated Shimmer on Hover */}
          <motion.div
            className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
          />
        </motion.button>
      </motion.div>

      {/* Accessibility Button - Top Right */}
      <motion.div
        className="fixed top-6 right-6 pointer-events-auto md:top-8 md:right-8"
        variants={buttonVariants}
      >
        <motion.button
          onClick={handleAccessibilityClick}
          className="relative group"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Open accessibility settings"
          title="Accessibility (Press A)"
        >
          {/* Glow Background Layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-gold-highlight/10 to-maroon-neon/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Soft Neon Border */}
          <div className="absolute inset-0 rounded-full border border-maroon-neon/40 group-hover:border-maroon-neon/80 shadow-lg shadow-maroon-neon/20 transition-all duration-300" />

          {/* Button Content */}
          <div className="relative w-12 h-12 md:w-14 md:h-14 backdrop-blur-sm bg-space-navy/60 rounded-full flex items-center justify-center text-text-primary">
            {/* Accessibility Icon */}
            <svg
              className="w-6 h-6 md:w-7 md:h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>

          {/* Rotating Glow Ring on Hover */}
          <motion.div
            className="absolute inset-0 rounded-full border border-transparent"
            style={{
              borderImage:
                "linear-gradient(45deg, #A71D2A, #FFD27F, #A71D2A) 1",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Animated Shimmer on Hover */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
