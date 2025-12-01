/**
 * Portal Rift Opening Effect
 *
 * SVG-based fractal rift animation for modal opening
 * Creates expanding temporal tear effect
 */

import { motion } from "framer-motion";

interface PortalRiftProps {
  isOpen: boolean;
  color?: string;
  size?: number;
}

export default function PortalRift({
  isOpen,
  color = "#A71D2A",
  size = 300,
}: PortalRiftProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={{
        scale: [0, 1.5, 1],
        rotate: [0, 180, 0],
        opacity: [0, 1, 0.5],
      }}
      exit={{
        scale: 0,
        rotate: -180,
        opacity: 0,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
        scale: {
          times: [0, 0.6, 1],
        },
        opacity: {
          times: [0, 0.4, 1],
        },
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        className="absolute inset-0"
      >
        <defs>
          {/* Radial gradient for glow */}
          <radialGradient id="rift-glow" cx="50%" cy="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="50%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>

          {/* Filter for blur effect */}
          <filter id="rift-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* Center glow circle */}
        <motion.circle
          cx="150"
          cy="150"
          r="0"
          fill="url(#rift-glow)"
          initial={{ r: 0 }}
          animate={{ r: [0, 100, 80] }}
          transition={{
            duration: 0.8,
            times: [0, 0.6, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        {/* Fractal rift lines - 8 directions */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (360 / 8) * i;
          const startX = 150;
          const startY = 150;
          const endX = 150 + Math.cos((angle * Math.PI) / 180) * 120;
          const endY = 150 + Math.sin((angle * Math.PI) / 180) * 120;

          return (
            <g key={i}>
              {/* Main rift line */}
              <motion.line
                x1={startX}
                y1={startY}
                x2={startX}
                y2={startY}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#rift-blur)"
                initial={{ x2: startX, y2: startY }}
                animate={{ x2: endX, y2: endY }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              {/* Fractal branches */}
              <motion.line
                x1={endX}
                y1={endY}
                x2={endX}
                y2={endY}
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
                initial={{
                  x2: endX,
                  y2: endY,
                }}
                animate={{
                  x2: endX + Math.cos(((angle + 30) * Math.PI) / 180) * 20,
                  y2: endY + Math.sin(((angle + 30) * Math.PI) / 180) * 20,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.3 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />

              <motion.line
                x1={endX}
                y1={endY}
                x2={endX}
                y2={endY}
                stroke={color}
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.6"
                initial={{
                  x2: endX,
                  y2: endY,
                }}
                animate={{
                  x2: endX + Math.cos(((angle - 30) * Math.PI) / 180) * 20,
                  y2: endY + Math.sin(((angle - 30) * Math.PI) / 180) * 20,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.3 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </g>
          );
        })}

        {/* Outer ring pulse */}
        <motion.circle
          cx="150"
          cy="150"
          r="50"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.4"
          initial={{ r: 50, opacity: 0 }}
          animate={{
            r: [50, 130, 140],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </svg>
    </motion.div>
  );
}
