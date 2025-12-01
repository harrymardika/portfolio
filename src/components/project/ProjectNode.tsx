import { motion } from "framer-motion";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import {
  riftRevealVariants,
  riftGlowVariants,
  projectNodeVariants,
} from "@/animations/rift/riftReveal";
import type { Project } from "@/types";

interface ProjectNodeProps {
  project: Project;
  onClick?: (project: Project) => void;
  isRevealed?: boolean;
  className?: string;
  index?: number; // For keyboard navigation
}

export default function ProjectNode({
  project,
  onClick,
  isRevealed = true,
  className = "",
  index = 0,
}: ProjectNodeProps) {
  const [ref, isIntersecting] = useIntersectionObserver<HTMLElement>({
    threshold: 0.3,
    rootMargin: "-50px",
    triggerOnce: true,
  });

  const shouldReveal = isRevealed && isIntersecting;

  const handleClick = () => {
    onClick?.(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(project);
    }
  };

  return (
    <motion.article
      ref={ref}
      className={`group relative ${className}`}
      data-project-id={project.id}
      data-project-index={index}
      variants={projectNodeVariants}
      initial="hidden"
      animate={shouldReveal ? "visible" : "hidden"}
    >
      {/* Rift Reveal Container with clipPath */}
      <motion.div
        className="relative"
        variants={riftRevealVariants}
        initial="hidden"
        animate={shouldReveal ? "visible" : "hidden"}
      >
        {/* Rift Edge Glow Effect */}
        <motion.div
          className="absolute -inset-2 rounded-lg pointer-events-none"
          style={{
            boxShadow:
              "0 0 20px rgba(167, 29, 42, 0.4), inset 0 0 20px rgba(167, 29, 42, 0.2)",
          }}
          variants={riftGlowVariants}
          initial="hidden"
          animate={shouldReveal ? "visible" : "hidden"}
        />

        {/* Fractal Tearing SVG Overlay */}
        <svg
          className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)] pointer-events-none z-rift-edges"
          style={{ overflow: "visible" }}
        >
          {/* Top-left fractal */}
          <motion.path
            d="M0,20 L10,10 L20,20 M10,10 L10,0"
            stroke="#A71D2A"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              shouldReveal
                ? { pathLength: 1, opacity: 0.4 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.3 }}
          />

          {/* Top-right fractal */}
          <motion.path
            d="M100%,-10 L95%,0 L100%,10"
            stroke="#A71D2A"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              shouldReveal
                ? { pathLength: 1, opacity: 0.4 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.4 }}
          />

          {/* Bottom-left fractal */}
          <motion.path
            d="M10,100% L0,95% L10,90%"
            stroke="#A71D2A"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              shouldReveal
                ? { pathLength: 1, opacity: 0.4 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.5 }}
          />

          {/* Bottom-right fractal */}
          <motion.path
            d="M100%,100% L95%,95% L90%,100% M95%,95% L100%,90%"
            stroke="#A71D2A"
            strokeWidth="1"
            fill="none"
            opacity="0.4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              shouldReveal
                ? { pathLength: 1, opacity: 0.4 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{ duration: 0.6, delay: 0.6 }}
          />
        </svg>

        {/* Project Card */}
        <motion.button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="relative w-full text-left bg-space-medium/50 backdrop-blur-sm border border-maroon-primary/30 rounded-lg p-6 transition-all duration-300 hover:border-maroon-neon/50 focus:outline-none focus:ring-2 focus:ring-maroon-neon focus:ring-offset-2 focus:ring-offset-space-navy"
          aria-label={`View details for ${project.name}`}
          tabIndex={0}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          {/* Project Name */}
          <h4 className="text-heading-3 font-semibold text-text-primary mb-2 group-hover:text-maroon-neon transition-colors">
            {project.name}
          </h4>

          {/* Description */}
          <p className="text-body text-text-secondary mb-4 line-clamp-2">
            {project.description || "No description available"}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 mb-4 text-body-sm text-text-muted">
            {/* Stars */}
            {project.stars > 0 && (
              <div className="flex items-center gap-1">
                <span aria-hidden="true">★</span>
                <span>{project.stars}</span>
              </div>
            )}

            {/* Primary Language */}
            {project.languages?.[0] && (
              <div className="flex items-center gap-1">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: project.languages[0].color || "#888",
                  }}
                  aria-hidden="true"
                />
                <span>{project.languages[0].name}</span>
              </div>
            )}

            {/* Updated Date */}
            <div>
              <span>{new Date(project.updatedAt).getFullYear()}</span>
            </div>
          </div>

          {/* Topics/Tags */}
          {project.topics && project.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 text-body-sm bg-maroon-primary/20 text-maroon-neon rounded border border-maroon-neon/20"
                >
                  {topic}
                </span>
              ))}
              {project.topics.length > 3 && (
                <span className="px-2 py-1 text-body-sm text-text-muted">
                  +{project.topics.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Hover Indicator */}
          <motion.div
            className="absolute top-4 right-4 transition-opacity"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            <span className="text-maroon-neon" aria-hidden="true">
              →
            </span>
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.article>
  );
}
