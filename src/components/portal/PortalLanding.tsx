import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  contentVariants,
  ctaVariants,
  scrollIndicatorVariants,
} from "@/animations/portal/portalVariants";
import WarpBackground from "./WarpBackground";
import PortalCanvas from "./PortalCanvas";

interface PortalLandingProps {
  onEnterTimeline?: () => void;
  onScrollToExplore?: () => void;
  children?: ReactNode;
}

export default function PortalLanding({
  onEnterTimeline,
  onScrollToExplore,
  children,
}: PortalLandingProps) {
  const reducedMotion = useReducedMotion();

  // Add scroll listener to detect scroll intent on landing page
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = (e: WheelEvent | TouchEvent) => {
      // Prevent multiple rapid triggers
      if (isScrolling) return;

      // Check scroll direction (wheel down or touch move down)
      const isScrollDown =
        (e instanceof WheelEvent && e.deltaY > 0) ||
        (e instanceof TouchEvent && true); // Touch always counts as scroll intent

      if (isScrollDown) {
        isScrolling = true;
        onScrollToExplore?.();

        // Prevent multiple rapid triggers
        scrollTimeout = setTimeout(() => {
          isScrolling = false;
        }, 500);
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [onScrollToExplore]);

  return (
    <section className="relative w-full h-screen bg-space-navy flex flex-col">
      {/* Background Layer - Starfield */}
      <div className="absolute inset-0 z-background w-full h-full">
        <WarpBackground
          density="medium"
          speed="normal"
          enableParallax={true}
          enableDistortion={true}
        />
      </div>

      {/* Portal Canvas Layer */}
      <div className="absolute inset-0 z-portal-base flex items-center justify-center w-full h-full">
        {children || (
          <div className="w-full h-full max-w-4xl max-h-4xl flex items-center justify-center">
            <PortalCanvas
              className="w-full h-full max-w-md max-h-md"
              isPulsing={!reducedMotion}
              reducedMotion={reducedMotion}
            />
          </div>
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-project-nodes flex w-full h-full flex-col items-center justify-center px-4">
        {/* Hero Title */}
        <motion.div
          className="text-center mb-12"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-display-1 font-bold text-text-primary mb-4 drop-shadow-lg">
            Harry Mardika
          </h1>
          <p className="text-heading-2 text-maroon-neon font-mono drop-shadow-lg">
            Temporal Portal
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={onEnterTimeline}
          variants={ctaVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          whileTap="tap"
          className="group relative px-8 py-4 text-body font-semibold text-text-primary"
        >
          <span className="relative z-10">Enter My Timeline</span>
          <div className="absolute inset-0 rounded-lg bg-maroon-primary opacity-80 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-0 rounded-lg bg-maroon-neon opacity-0 blur-xl transition-opacity group-hover:opacity-50" />

          {/* Button border glow */}
          <div className="absolute inset-0 rounded-lg border-2 border-maroon-neon/30 group-hover:border-maroon-neon/60 transition-colors" />
        </motion.button>

        {/* Scroll Indicator - Absolutely positioned overlay for precise centering */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-project-nodes cursor-pointer pointer-events-auto"
          variants={scrollIndicatorVariants}
          initial="hidden"
          animate={["visible", "animate"]}
          onClick={onScrollToExplore}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onScrollToExplore?.();
            }
          }}
          aria-label="Scroll to explore the timeline"
        >
          <div className="flex flex-col items-center gap-2 text-text-muted hover:text-text-primary transition-colors">
            <span className="text-body-sm font-semibold">
              Scroll to explore
            </span>
            <motion.div
              className="h-8 w-px bg-text-muted opacity-50"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-transparent via-transparent to-space-navy/50" />
    </section>
  );
}
