/**
 * Accessibility Button Component
 *
 * Floating button that opens the accessibility panel
 * Always visible in top-right corner
 */

import { motion } from "framer-motion";

interface AccessibilityButtonProps {
  onClick: () => void;
}

export default function AccessibilityButton({
  onClick,
}: AccessibilityButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed top-4 right-4 z-modal w-12 h-12 bg-maroon-primary/80 
                 hover:bg-maroon-neon backdrop-blur-sm border border-maroon-neon/30 
                 rounded-full text-text-primary font-bold transition-colors 
                 flex items-center justify-center shadow-lg group"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Open accessibility settings"
      title="Accessibility (Press A)"
    >
      {/* Settings Icon */}
      <svg
        className="w-6 h-6 transition-transform group-hover:rotate-90 duration-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
        />
      </svg>

      {/* Keyboard hint badge */}
      <span
        className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 
                       bg-space-deep/90 border border-maroon-neon/30 rounded 
                       text-xs font-mono whitespace-nowrap opacity-0 
                       group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        Press A
      </span>
    </motion.button>
  );
}
