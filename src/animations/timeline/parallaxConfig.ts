// Parallax configuration for Time-Warp background system
// Depth-based parallax layers with speed multipliers

export interface ParallaxLayer {
  depth: number;
  speed: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
}

export const parallaxConfig = {
  // Layer definitions from far to near
  layers: [
    {
      depth: 100,
      speed: 0.1,
      scale: 0.5,
      opacity: 0.3,
      blur: 1,
      zIndex: 0,
    },
    {
      depth: 75,
      speed: 0.25,
      scale: 0.7,
      opacity: 0.5,
      blur: 0.5,
      zIndex: 5,
    },
    {
      depth: 50,
      speed: 0.5,
      scale: 0.85,
      opacity: 0.7,
      blur: 0,
      zIndex: 10,
    },
    {
      depth: 25,
      speed: 0.75,
      scale: 1,
      opacity: 0.9,
      blur: 0,
      zIndex: 15,
    },
    {
      depth: 10,
      speed: 1,
      scale: 1.2,
      opacity: 1,
      blur: 0,
      zIndex: 20,
    },
  ] as ParallaxLayer[],

  // Scroll speed multiplier
  scrollMultiplier: 1.5,

  // Mouse parallax sensitivity
  mouseSensitivity: 0.02,

  // Smooth damping factor (0-1, higher = smoother)
  dampingFactor: 0.1,

  // Performance thresholds
  performance: {
    highEnd: {
      particleCount: 200,
      updateRate: 60,
    },
    midRange: {
      particleCount: 100,
      updateRate: 30,
    },
    lowEnd: {
      particleCount: 50,
      updateRate: 15,
    },
  },
};

// Helper to calculate parallax offset
export function calculateParallaxOffset(
  scrollPosition: number,
  layerSpeed: number,
  scrollMultiplier: number = parallaxConfig.scrollMultiplier
): number {
  return scrollPosition * layerSpeed * scrollMultiplier;
}

// Helper to calculate mouse parallax
export function calculateMouseParallax(
  mouseX: number,
  mouseY: number,
  centerX: number,
  centerY: number,
  depth: number
): { x: number; y: number } {
  const sensitivity = parallaxConfig.mouseSensitivity;
  const offsetX = ((mouseX - centerX) / centerX) * depth * sensitivity;
  const offsetY = ((mouseY - centerY) / centerY) * depth * sensitivity;
  return { x: offsetX, y: offsetY };
}
