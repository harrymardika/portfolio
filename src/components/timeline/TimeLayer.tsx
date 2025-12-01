import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  timeLayerVariants,
  yearMarkerVariants,
  decorativeLineVariants,
  projectGridVariants,
} from "@/animations/timeline/timeLayerTransition";

interface TimeLayerProps {
  year: number;
  projects?: any[];
  children?: ReactNode;
  isVisible?: boolean;
  className?: string;
}

export default function TimeLayer({
  year,
  projects = [],
  children,
  isVisible = true,
  className = "",
}: TimeLayerProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLElement>({
    threshold: 0.2,
    rootMargin: "-100px",
    triggerOnce: true,
  });

  // Calculate curved positioning for projects along an invisible arc
  // Reserved for future curved layout implementation
  // const calculateCurvedPosition = (index: number, total: number) => {
  //   const angle = (index / (total - 1)) * Math.PI - Math.PI / 2; // -90deg to 90deg
  //   const radius = 150; // Curve radius in pixels
  //   const x = Math.sin(angle) * radius;
  //   const y = Math.cos(angle) * radius * 0.3; // Flatten the curve
  //   return { x, y };
  // };
  return (
    <motion.section
      ref={ref}
      className={`relative ${className}`}
      data-year={year}
      variants={timeLayerVariants}
      initial="hidden"
      animate={isIntersecting ? "visible" : "hidden"}
      style={{
        opacity: isVisible ? 1 : 0.5,
      }}
    >
      {/* Year Label */}
      <div className="relative mb-8 pl-20">
        <div className="flex items-center gap-6">
          {/* Year Marker */}
          <div className="absolute left-0 -translate-x-1/2">
            <motion.div className="relative" variants={yearMarkerVariants}>
              {/* Outer Ring */}
              <div className="h-16 w-16 rounded-full border-2 border-maroon-neon bg-space-navy flex items-center justify-center relative z-10">
                {/* Inner Dot */}
                <motion.div
                  className="h-4 w-4 rounded-full bg-maroon-neon"
                  animate="pulse"
                  variants={yearMarkerVariants}
                />
              </div>

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-maroon-neon opacity-20 blur-lg"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Rift fracture lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: "scale(1.5)" }}
              >
                <motion.path
                  d="M32,16 L32,0 M16,32 L0,32 M48,32 L64,32 M32,48 L32,64"
                  stroke="#A71D2A"
                  strokeWidth="1"
                  fill="none"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isIntersecting ? 1 : 0 }}
                  transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Year Text */}
          <motion.h3
            className="text-heading-1 font-bold text-text-primary font-mono"
            initial={{ opacity: 0, x: -20 }}
            animate={
              isIntersecting ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }
            }
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {year}
          </motion.h3>

          {/* Project Count Badge */}
          <motion.span
            className="px-3 py-1 rounded-full bg-maroon-primary/20 text-body-sm text-maroon-neon border border-maroon-neon/30"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              isIntersecting
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.8 }
            }
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </motion.span>
        </div>

        {/* Decorative Line */}
        <motion.div
          className="mt-4 h-px bg-gradient-to-r from-maroon-neon/50 to-transparent origin-left"
          variants={decorativeLineVariants}
        />
      </div>

      {/* Projects Grid with Curved Layout */}
      <motion.div className="pl-20" variants={projectGridVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children}
        </div>
      </motion.div>

      {/* Rift Visual Effect - Fractal Tearing */}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-64 pointer-events-none overflow-visible">
        {/* Vertical rift line */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-maroon-neon to-transparent"
          initial={{ scaleY: 0, opacity: 0 }}
          animate={
            isIntersecting
              ? { scaleY: 1, opacity: 0.5 }
              : { scaleY: 0, opacity: 0 }
          }
          transition={{ duration: 0.8, delay: 0.4 }}
        />

        {/* Fractal branches */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ overflow: "visible" }}
        >
          {/* Main fractal pattern */}
          <motion.path
            d="M16,0 L16,80 L32,80 M16,80 L0,80 M16,120 L8,128 M16,120 L24,128 M16,180 L16,256"
            stroke="#A71D2A"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              isIntersecting
                ? { pathLength: 1, opacity: 0.4 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 1.2, delay: 0.6, ease: [0.65, 0, 0.35, 1] }}
          />

          {/* Glow effect on rift */}
          <motion.path
            d="M16,0 L16,256"
            stroke="url(#riftGradient)"
            strokeWidth="4"
            fill="none"
            filter="url(#riftGlow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              isIntersecting
                ? { pathLength: 1, opacity: 0.6 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 1, delay: 0.5 }}
          />

          <defs>
            <linearGradient id="riftGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A71D2A" stopOpacity="0" />
              <stop offset="50%" stopColor="#A71D2A" stopOpacity="1" />
              <stop offset="100%" stopColor="#A71D2A" stopOpacity="0" />
            </linearGradient>
            <filter id="riftGlow">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>
        </svg>

        {/* Energy particles along rift */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-4 w-2 h-2 rounded-full bg-gold-highlight"
            style={{
              top: `${20 + i * 15}%`,
              boxShadow: "0 0 8px rgba(255, 210, 127, 0.8)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isIntersecting
                ? {
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -50],
                  }
                : { opacity: 0 }
            }
            transition={{
              duration: 2,
              delay: 0.8 + i * 0.2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </div>
    </motion.section>
  );
}
