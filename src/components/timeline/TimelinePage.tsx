import { ReactNode, useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import WarpBackground from "@/components/portal/WarpBackground";
import FilterControls from "./FilterControls";
import { playSound } from "@/lib/sound";

interface TimelinePageProps {
  children?: ReactNode;
  onScroll?: (progress: number) => void;
  className?: string;
  onBackToPortal?: () => void;
  onAccessibilityClick?: () => void;
}

export default function TimelinePage({
  children,
  onScroll,
  className = "",
  onBackToPortal,
  onAccessibilityClick,
}: TimelinePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [yearRange] = useState({ start: 2020, end: 2025 });

  // Filter state
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeYears, setActiveYears] = useState<number[]>([]);
  const [allTags] = useState<string[]>([
    "React",
    "TypeScript",
    "Tailwind",
    "Animation",
    "WebGL",
    "Performance",
    "Accessibility",
    "Node.js",
  ]);
  const [allYears] = useState<number[]>([2020, 2021, 2022, 2023, 2024, 2025]);

  // Use Framer Motion's useScroll with container ref
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Parallax transform for background using Framer Motion's motion value
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -150]);

  useEffect(() => {
    onScroll?.(scrollProgress);
  }, [scrollProgress, onScroll]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollProg =
      target.scrollHeight > target.clientHeight
        ? target.scrollTop / (target.scrollHeight - target.clientHeight)
        : 0;

    setScrollProgress(scrollProg);
    onScroll?.(scrollProg);
  };

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleYearToggle = (year: number) => {
    setActiveYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const handleResetFilters = () => {
    setActiveTags([]);
    setActiveYears([]);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-y-auto overflow-x-hidden bg-space-navy ${className}`}
      onScroll={handleScroll}
    >
      {/* Background Starfield with Parallax - Fixed positioning */}
      <motion.div
        className="fixed inset-0 z-background w-full h-full"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 w-full h-full">
          <WarpBackground
            density="medium"
            speed="slow"
            enableParallax={true}
            enableDistortion={true}
          />
        </div>
      </motion.div>

      {/* Parallax Container */}
      <div className="relative z-10">
        {/* Timeline Header - Sticky with Three-Column Layout */}
        <motion.header
          className="sticky top-0 z-modal bg-space-navy/80 backdrop-blur-md border-b border-maroon-primary/20"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full px-4 py-4 md:px-6 lg:px-8">
            {/* Three-Column Header Layout */}
            <div className="flex items-center justify-between gap-4">
              {/* LEFT: Back to Portal Button */}
              <div className="flex-shrink-0">
                {onBackToPortal && (
                  <motion.button
                    onClick={() => {
                      playSound("click");
                      onBackToPortal();
                    }}
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
                    <div className="relative px-3 md:px-4 py-2 backdrop-blur-sm bg-space-navy/60 rounded-lg flex items-center gap-2 text-sm md:text-base font-semibold text-text-primary">
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
                )}
              </div>

              {/* CENTER: Title (Flex-grow to fill space) */}
              <div className="flex-grow flex items-center justify-center gap-2 md:gap-4">
                <h2 className="text-heading-2 font-bold text-text-primary whitespace-nowrap">
                  Timeline
                </h2>
                <span className="text-body text-text-muted font-mono hidden md:inline">
                  {yearRange.start} — {yearRange.end}
                </span>
              </div>

              {/* RIGHT: Accessibility Button */}
              <div className="flex-shrink-0">
                {onAccessibilityClick && (
                  <motion.button
                    onClick={() => {
                      playSound("click");
                      onAccessibilityClick();
                    }}
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
                    <div className="relative w-10 h-10 md:w-12 md:h-12 backdrop-blur-sm bg-space-navy/60 rounded-full flex items-center justify-center text-text-primary">
                      {/* Accessibility Icon */}
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6"
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
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                    {/* Animated Shimmer on Hover */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Filter Controls Below Title */}
            <div className="mt-4 border-t border-maroon-primary/10 pt-4">
              <FilterControls
                tags={allTags}
                activeTags={activeTags}
                years={allYears}
                activeYears={activeYears}
                onTagToggle={handleTagToggle}
                onYearToggle={handleYearToggle}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        </motion.header>

        {/* Timeline Content */}
        <main className="container mx-auto px-4 py-12">
          {/* Timeline Axis */}
          <div className="relative">
            {/* Vertical Timeline Line with Glow */}
            <motion.div
              className="absolute left-8 top-0 bottom-0 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, #A71D2A, #6B0F1A, transparent)",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* Animated glow on timeline */}
            <motion.div
              className="absolute left-8 w-1 h-32 -translate-x-1/2"
              style={{
                background:
                  "radial-gradient(circle, rgba(167, 29, 42, 0.6), transparent)",
                filter: "blur(10px)",
                top: `${scrollProgress * 100}%`,
              }}
            />
            {/* Time Layers Container */}
            <div className="space-y-24 relative z-10">{children}</div>
          </div>
        </main>

        {/* Timeline Footer */}
        <footer className="py-12 text-center text-text-muted">
          <p className="text-body-sm">End of Timeline</p>
        </footer>
      </div>

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed bottom-8 right-8 z-modal"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-32 w-1 rounded-full bg-space-medium overflow-hidden relative">
            <motion.div
              className="w-full bg-maroon-neon absolute top-0"
              style={{ height: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <span className="text-body-sm text-text-muted font-mono">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </motion.div>
    </div>
  );
}
