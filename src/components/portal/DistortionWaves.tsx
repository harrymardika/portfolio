import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface DistortionWavesProps {
  className?: string;
  waveCount?: number;
  speed?: number;
}

interface Wave {
  phase: number;
  amplitude: number;
  frequency: number;
  speed: number;
  color: string;
  thickness: number;
}

export default function DistortionWaves({
  className = "",
  waveCount = 3,
  speed = 1,
}: DistortionWavesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<Wave[]>([]);
  const animationFrameRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  // Initialize waves
  useEffect(() => {
    if (reducedMotion) return;

    wavesRef.current = Array.from({ length: waveCount }, (_, i) => ({
      phase: (Math.PI * 2 * i) / waveCount,
      amplitude: 20 + Math.random() * 40,
      frequency: 0.003 + Math.random() * 0.002,
      speed: (0.01 + Math.random() * 0.02) * speed,
      color:
        i % 2 === 0 ? "rgba(167, 29, 42, 0.15)" : "rgba(255, 210, 127, 0.1)", // maroon-neon or gold
      thickness: 1 + Math.random() * 2,
    }));
  }, [waveCount, speed, reducedMotion]);

  // Canvas setup and animation
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let time = 0;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      time += 0.016; // ~60fps

      wavesRef.current.forEach((wave) => {
        ctx.save();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = wave.thickness;
        ctx.globalCompositeOperation = "screen";

        // Update phase
        wave.phase += wave.speed;

        // Draw wave
        ctx.beginPath();

        for (let x = 0; x < rect.width; x += 2) {
          const progress = x / rect.width;
          const y =
            rect.height / 2 +
            Math.sin(x * wave.frequency + wave.phase) * wave.amplitude +
            Math.sin(time + progress * Math.PI * 2) * 10; // Additional movement

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ mixBlendMode: "screen", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
