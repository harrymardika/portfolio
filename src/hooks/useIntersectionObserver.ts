import { useEffect, useRef, useState } from "react";

interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to observe element visibility using Intersection Observer API
 * Used for triggering rift reveal animations when projects enter viewport
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options: IntersectionObserverOptions = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const hasIntersectedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            hasIntersectedRef.current = true;

            // Disconnect if triggerOnce is true
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce && hasIntersectedRef.current) {
            setIsIntersecting(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [elementRef, isIntersecting];
}
