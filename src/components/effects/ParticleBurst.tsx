/**
 * Particle Burst Effect Component
 *
 * Creates a burst of particles when modal opens
 * Simulates temporal energy release
 */

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  duration: number;
  delay: number;
}

interface ParticleBurstProps {
  isActive: boolean;
  particleCount?: number;
  color?: string;
  duration?: number;
}

export default function ParticleBurst({
  isActive,
  particleCount = 20,
  color = "#A71D2A",
  duration = 1.5,
}: ParticleBurstProps) {
  // Generate particles with randomized properties
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      angle: (360 / particleCount) * i + Math.random() * 20 - 10,
      distance: 100 + Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: duration * (0.8 + Math.random() * 0.4),
      delay: Math.random() * 0.2,
    }));
  }, [particleCount, duration]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: "50%",
            top: "50%",
            width: particle.size,
            height: particle.size,
            backgroundColor: color,
            boxShadow: `0 0 ${particle.size * 2}px ${color}`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: [0.22, 1, 0.36, 1],
            opacity: {
              times: [0, 0.5, 1],
            },
          }}
        />
      ))}

      {/* Center flash effect */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{
          scale: 0,
          opacity: 1,
        }}
        animate={{
          scale: [0, 2, 4],
          opacity: [1, 0.6, 0],
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div
          className="w-20 h-20 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
