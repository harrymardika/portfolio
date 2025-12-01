/**
 * Timeline Header Bar
 * Fixed header positioned above the timeline content
 * Contains navigation controls (Back to Portal, Accessibility) separate from the title
 */

import { motion } from "framer-motion";
import { playSound } from "@/lib/sound";

interface TimelineHeaderBarProps {
  onBackToPortal: () => void;
  onAccessibilityClick: () => void;
}

export default function TimelineHeaderBar({
  onBackToPortal,
  onAccessibilityClick,
}: TimelineHeaderBarProps) {
  const handleAccessibilityClick = () => {
    playSound("click");
    onAccessibilityClick();
  };

  const handleBackClick = () => {
    playSound("click");
    onBackToPortal();
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-space-navy/80 backdrop-blur-md border-b border-maroon-primary/20 flex items-center justify-between px-6"
      initial={{ opacity: 0, y: -64 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Left: Back to Portal Button */}
      <motion.button
        onClick={handleBackClick}
        className="px-4 py-2 bg-maroon-primary/80 hover:bg-maroon-neon backdrop-blur-sm border border-maroon-neon/30 rounded-lg text-text-primary font-semibold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Back to portal"
        title="Back to Portal"
      >
        ← Back to Portal
      </motion.button>

      {/* Right: Accessibility Button */}
      <motion.button
        onClick={handleAccessibilityClick}
        className="w-12 h-12 bg-maroon-primary/80 hover:bg-maroon-neon backdrop-blur-sm border border-maroon-neon/30 rounded-full text-text-primary font-bold transition-colors flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open accessibility settings"
        title="Accessibility (Press A)"
      >
        <svg
          className="w-6 h-6"
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
      </motion.button>
    </motion.div>
  );
}
