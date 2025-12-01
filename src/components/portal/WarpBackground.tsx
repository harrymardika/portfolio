import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePerformanceTier } from "@/hooks/usePerformanceTier";
import {
  parallaxConfig,
  calculateMouseParallax,
} from "@/animations/timeline/parallaxConfig";
import DistortionWaves from "./DistortionWaves";

interface WarpBackgroundProps {
  className?: string;
  density?: "low" | "medium" | "high";
  speed?: "slow" | "normal" | "fast";
  enableParallax?: boolean;
  enableDistortion?: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  speed: number;
  color: string;
}

export default function WarpBackground({
  className = "",
  density = "medium",
  speed = "normal",
  enableParallax = true,
  enableDistortion = true,
}: WarpBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const performanceTier = usePerformanceTier();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Star count based on density and performance
  const getStarCount = () => {
    const densityBase = {
      low: 150,
      medium: 300,
      high: 500,
    }[density];

    // Adjust for performance tier
    const performanceMultiplier = {
      high: 1,
      medium: 0.7,
      low: 0.4,
    }[performanceTier];

    const adjusted = Math.floor(densityBase * performanceMultiplier);

    // Reduce on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return Math.floor(adjusted * 0.6);
    }
    return adjusted;
  };

  const speedMultiplier = {
    slow: 0.5,
    normal: 1,
    fast: 1.5,
  }[speed];

  // Initialize canvas starfield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Set canvas size to match container dimensions
    const resizeCanvas = () => {
      if (!canvas.parentElement) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      const width = Math.max(rect.width, window.innerWidth);
      const height = Math.max(rect.height, window.innerHeight);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Ensure canvas fills viewport
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize stars
    const starCount = getStarCount();
    starsRef.current = Array.from({ length: starCount }, () => {
      const z = Math.random() * 100; // Depth 0-100
      const layer =
        parallaxConfig.layers.find((l) => z >= l.depth) ||
        parallaxConfig.layers[0];

      // Color variations: white, blue-white, gold-white
      const colorChoice = Math.random();
      let color: string;
      if (colorChoice < 0.7) {
        color = "#E6E6EA"; // text-primary
      } else if (colorChoice < 0.9) {
        color = "#B8B8C0"; // text-secondary
      } else {
        color = "#FFD27F"; // gold-highlight
      }

      return {
        x: (Math.random() * canvas.width) / dpr,
        y: (Math.random() * canvas.height) / dpr,
        z,
        size: 0.5 + Math.random() * 2 * layer.scale,
        brightness: 0.3 + Math.random() * 0.7,
        speed: layer.speed * speedMultiplier,
        color,
      };
    });

    setIsCanvasReady(true);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [density, speed]);

  // Mouse tracking for parallax
  useEffect(() => {
    if (!enableParallax || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableParallax, reducedMotion]);

  // Canvas animation loop
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // const dpr = window.devicePixelRatio || 1; // Reserved for future high-DPI rendering
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let animationTime = 0;

    const animate = () => {
      if (reducedMotion) {
        // Static render for reduced motion
        ctx.clearRect(0, 0, rect.width, rect.height);

        starsRef.current.forEach((star) => {
          ctx.save();
          ctx.globalAlpha = star.brightness * 0.6;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        return;
      }

      animationTime += 0.016; // ~60fps

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Update and draw stars
      starsRef.current.forEach((star, i) => {
        // Parallax offset based on mouse
        let offsetX = 0;
        let offsetY = 0;

        if (enableParallax) {
          const parallax = calculateMouseParallax(
            mouseRef.current.x,
            mouseRef.current.y,
            centerX,
            centerY,
            star.z
          );
          offsetX = parallax.x * 100;
          offsetY = parallax.y * 100;
        }

        // Drift animation
        const driftX = Math.sin(animationTime * star.speed + i) * 0.5;
        const driftY = Math.cos(animationTime * star.speed * 0.7 + i) * 0.5;

        const x = star.x + offsetX + driftX;
        const y = star.y + offsetY + driftY;

        // Twinkle effect
        const twinkle = 0.5 + Math.sin(animationTime * 2 + i * 0.5) * 0.5;
        const brightness = star.brightness * twinkle;

        // Draw star with glow
        ctx.save();
        ctx.globalAlpha = brightness;

        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 3);
        gradient.addColorStop(0, star.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, star.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.globalAlpha = brightness * 1.5;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(x, y, star.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Wrap around edges
        if (x < -10) star.x = rect.width + 10;
        if (x > rect.width + 10) star.x = -10;
        if (y < -10) star.y = rect.height + 10;
        if (y > rect.height + 10) star.y = -10;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (!reducedMotion) {
      animate();
    } else {
      // Single render for reduced motion
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCanvasReady, reducedMotion, enableParallax]);

  return (
    <div
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{
        backgroundColor: "var(--color-space-navy, #080910)",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      {/* Canvas Starfield - High Performance Multi-Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-starfield"
        style={{
          mixBlendMode: "screen",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Distortion Waves Layer */}
      {enableDistortion && !reducedMotion && (
        <DistortionWaves
          className="absolute inset-0 z-starfield opacity-30"
          waveCount={3}
          speed={speedMultiplier}
        />
      )}

      {/* Fallback DOM Stars for initial render (prevents flash) */}
      {!isCanvasReady && (
        <div className="absolute inset-0 z-starfield">
          <div className="absolute inset-0 animate-pulse opacity-30">
            <div className="h-full w-full bg-gradient-radial from-text-primary/10 via-transparent to-transparent" />
          </div>
        </div>
      )}

      {/* Nebula Gradient Overlay - Creates depth atmosphere */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-maroon-dark/20 via-transparent to-transparent"
        style={{
          opacity: 0.5,
          pointerEvents: "none",
        }}
        animate={
          !reducedMotion
            ? {
                opacity: [0.4, 0.6, 0.4],
              }
            : {}
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Depth fog gradient - Enhances parallax perception */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-space-navy/10 to-space-navy/30"
        style={{ pointerEvents: "none" }}
      />

      {/* Vignette for portal focus */}
      <div
        className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-space-navy/40"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(8, 9, 16, 0.4) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
