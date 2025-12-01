import { useState, useEffect } from "react";

export type PerformanceTier = "high" | "medium" | "low";

/**
 * Hook to detect device performance tier
 * Used to adjust particle counts and animation quality
 */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("medium");

  useEffect(() => {
    // Check device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory;

    // Check hardware concurrency (CPU cores)
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;

    // Check connection (if available)
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || "4g";

    // Check if mobile
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // Calculate performance score
    let score = 0;

    // Memory scoring
    if (deviceMemory) {
      if (deviceMemory >= 8) score += 30;
      else if (deviceMemory >= 4) score += 20;
      else score += 10;
    } else {
      score += 15; // Default if unavailable
    }

    // CPU scoring
    if (hardwareConcurrency >= 8) score += 30;
    else if (hardwareConcurrency >= 4) score += 20;
    else score += 10;

    // Connection scoring
    if (effectiveType === "4g") score += 20;
    else if (effectiveType === "3g") score += 10;
    else score += 5;

    // Device type penalty
    if (isMobile) score -= 20;

    // Determine tier
    if (score >= 60) {
      setTier("high");
    } else if (score >= 40) {
      setTier("medium");
    } else {
      setTier("low");
    }
  }, []);

  return tier;
}
