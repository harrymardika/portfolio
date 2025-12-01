import { useEffect, useState } from "react";

interface ScrollProgress {
  scrollY: number;
  scrollProgress: number; // 0-1
  scrollDirection: "up" | "down" | null;
}

/**
 * Hook to track scroll position and direction
 * Used for timeline parallax and scroll-based animations
 */
export function useScrollProgress(): ScrollProgress {
  const [scrollState, setScrollState] = useState<ScrollProgress>({
    scrollY: 0,
    scrollProgress: 0,
    scrollDirection: null,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = documentHeight > 0 ? scrollY / documentHeight : 0;

      const scrollDirection =
        scrollY > lastScrollY ? "down" : scrollY < lastScrollY ? "up" : null;

      setScrollState({
        scrollY,
        scrollProgress,
        scrollDirection,
      });

      lastScrollY = scrollY;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial update
    updateScrollState();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollState;
}
