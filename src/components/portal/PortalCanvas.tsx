import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ParticleEngine } from "@/animations/portal/particleSystem";
import {
  portalEntranceVariants,
  ringVariants,
} from "@/animations/portal/portalVariants";

interface PortalCanvasProps {
  className?: string;
  isPulsing?: boolean;
  reducedMotion?: boolean;
}

export default function PortalCanvas({
  className = "",
  isPulsing = true,
  reducedMotion = false,
}: PortalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const particleEngineRef = useRef<ParticleEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize particle engine
    const particleCount = reducedMotion ? 20 : 80;
    particleEngineRef.current = new ParticleEngine(
      canvasRef.current,
      particleCount,
      reducedMotion
    );

    particleEngineRef.current.start();

    return () => {
      particleEngineRef.current?.destroy();
    };
  }, [reducedMotion]);

  // Update particle engine when reduced motion changes
  useEffect(() => {
    if (particleEngineRef.current) {
      particleEngineRef.current.setReducedMotion(reducedMotion);
    }
  }, [reducedMotion]);

  return (
    <motion.div
      className={`relative ${className}`}
      variants={portalEntranceVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Noise/Distortion Layer */}
      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
        <svg className="w-full h-full">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* SVG Portal Rings */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ring 1 - Outer */}
        <motion.circle
          cx="400"
          cy="400"
          r="300"
          fill="none"
          stroke="url(#portalGradient1)"
          strokeWidth="2"
          opacity="0.6"
          className={!reducedMotion ? "animate-portal-spin" : ""}
          style={{ transformOrigin: "center" }}
          variants={ringVariants}
        />

        {/* Ring 2 - Middle */}
        <motion.circle
          cx="400"
          cy="400"
          r="200"
          fill="none"
          stroke="url(#portalGradient2)"
          strokeWidth="3"
          opacity="0.8"
          className={!reducedMotion ? "animate-portal-spin" : ""}
          style={{ animationDuration: "15s", transformOrigin: "center" }}
          variants={ringVariants}
        />

        {/* Ring 3 - Inner */}
        <motion.circle
          cx="400"
          cy="400"
          r="100"
          fill="none"
          stroke="url(#portalGradient3)"
          strokeWidth="4"
          opacity="1"
          className={!reducedMotion && isPulsing ? "animate-portal-pulse" : ""}
          style={{ transformOrigin: "center" }}
          variants={ringVariants}
        />

        {/* Core Glow */}
        <motion.circle
          cx="400"
          cy="400"
          r="40"
          fill="url(#coreGradient)"
          opacity="0.9"
          filter="url(#glow)"
          variants={ringVariants}
        />

        {/* Gradient Definitions */}
        <defs>
          <radialGradient id="portalGradient1">
            <stop offset="0%" stopColor="#A71D2A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6B0F1A" stopOpacity="0.8" />
          </radialGradient>

          <radialGradient id="portalGradient2">
            <stop offset="0%" stopColor="#A71D2A" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6B0F1A" stopOpacity="0.9" />
          </radialGradient>

          <radialGradient id="portalGradient3">
            <stop offset="0%" stopColor="#FFD27F" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A71D2A" stopOpacity="1" />
          </radialGradient>

          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="#FFD27F" />
            <stop offset="100%" stopColor="#A71D2A" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Canvas for Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-particles pointer-events-none"
        aria-hidden="true"
      />

      {/* Additional Ring Effects */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        variants={ringVariants}
      >
        {/* Outer Glow Ring */}
        <div
          className="absolute rounded-full border border-maroon-neon/20"
          style={{
            width: "clamp(400px, 50vw, 600px)",
            height: "clamp(400px, 50vw, 600px)",
            boxShadow:
              "0 0 60px rgba(167, 29, 42, 0.3), inset 0 0 60px rgba(167, 29, 42, 0.1)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
