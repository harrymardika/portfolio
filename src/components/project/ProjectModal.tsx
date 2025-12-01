import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import {
  backdropVariants,
  modalContainerVariants,
  heroImageVariants,
  contentSectionVariants,
  chipVariants,
  closeButtonVariants,
  languageBarVariants,
} from "@/animations/modal/modalTransitions";
import ParticleBurst from "@/components/effects/ParticleBurst";
import PortalRift from "@/components/effects/PortalRift";

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({
  project,
  isOpen,
  onClose,
}: ProjectModalProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [showRift, setShowRift] = useState(false);
  const { accessibility } = useAppStore();

  // Determine if animations should be reduced
  const shouldAnimate = !accessibility.reducedMotion;

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      // Trigger particle burst and rift on open (only if animations enabled)
      if (shouldAnimate) {
        setShowParticles(true);
        setShowRift(true);

        // Reset after animation
        const particleTimer = setTimeout(() => setShowParticles(false), 1500);
        const riftTimer = setTimeout(() => setShowRift(false), 1000);

        return () => {
          clearTimeout(particleTimer);
          clearTimeout(riftTimer);
          document.removeEventListener("keydown", handleEscape);
          document.body.style.overflow = "";
        };
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, shouldAnimate]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && project && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-space-navy/90 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Portal Rift Opening Effect */}
          {shouldAnimate && (
            <PortalRift isOpen={showRift} color="#A71D2A" size={400} />
          )}

          {/* Modal Content with Cinematic Zoom */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-space-medium border-2 border-maroon-neon/50 rounded-xl shadow-2xl"
            variants={shouldAnimate ? modalContainerVariants : {}}
            initial={shouldAnimate ? "hidden" : false}
            animate={shouldAnimate ? "visible" : false}
            exit={shouldAnimate ? "exit" : undefined}
            style={{
              transformPerspective: 1200,
            }}
          >
            {/* Particle Burst Effect */}
            {shouldAnimate && (
              <ParticleBurst
                isActive={showParticles}
                particleCount={25}
                color="#A71D2A"
                duration={1.2}
              />
            )}

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-space-navy/80 text-text-primary hover:bg-maroon-neon hover:text-space-navy transition-colors focus:outline-none focus:ring-2 focus:ring-maroon-neon backdrop-blur-sm"
              aria-label="Close modal"
              variants={closeButtonVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>

            {/* Scrollable Content Container */}
            <div className="overflow-y-auto max-h-[90vh] custom-scrollbar">
              {/* Hero Image Section with Parallax */}
              <div className="relative h-80 bg-gradient-to-br from-maroon-dark to-space-deep overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  variants={heroImageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {project.heroImage ? (
                    <img
                      src={project.heroImage}
                      alt={`${project.name} screenshot`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-maroon-primary/20 via-space-deep to-maroon-dark/30">
                      <div className="text-center">
                        <motion.div
                          className="text-8xl mb-6"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 200,
                            delay: 0.3,
                          }}
                        >
                          🚀
                        </motion.div>
                        <motion.p
                          className="text-heading-2 text-text-primary font-mono"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          {project.name}
                        </motion.p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-space-medium via-transparent to-transparent" />

                {/* Energy particles on hero */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 rounded-full bg-gold-highlight"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + i * 10}%`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        y: [-20, -60],
                      }}
                      transition={{
                        duration: 2,
                        delay: 0.5 + i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                {/* Header Section */}
                <motion.div
                  className="mb-8"
                  custom={0}
                  variants={contentSectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2
                    id="modal-title"
                    className="text-heading-1 font-bold text-text-primary mb-4"
                  >
                    {project.name}
                  </h2>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-4 text-body text-text-muted">
                    {/* Stars */}
                    {project.stars > 0 && (
                      <motion.div
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-gold-highlight/10 border border-gold-highlight/30"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-gold-highlight text-lg">★</span>
                        <span className="font-semibold text-gold-highlight">
                          {project.stars}
                        </span>
                      </motion.div>
                    )}

                    {/* Year */}
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{project.year}</span>
                    </div>

                    {/* Updated */}
                    <div className="flex items-center gap-2">
                      <span>🔄</span>
                      <span>
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Description Section */}
                <motion.div
                  className="mb-8"
                  custom={1}
                  variants={contentSectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h3 className="text-heading-3 font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <span className="text-maroon-neon">▸</span>
                    About
                  </h3>
                  <div className="pl-6 border-l-2 border-maroon-primary/30">
                    <p className="text-body text-text-secondary leading-relaxed">
                      {project.description ||
                        "No description available for this project."}
                    </p>
                  </div>
                </motion.div>

                {/* Tech Stack Section */}
                {project.languages && project.languages.length > 0 && (
                  <motion.div
                    className="mb-8"
                    custom={2}
                    variants={contentSectionVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-heading-3 font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <span className="text-maroon-neon">▸</span>
                      Tech Stack
                    </h3>

                    {/* Language bars with percentages */}
                    <div className="space-y-3 mb-4">
                      {project.languages
                        .filter(
                          (lang) => lang.percentage && lang.percentage > 5
                        )
                        .map((lang, index) => (
                          <div key={lang.name} className="pl-6">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{
                                    backgroundColor: lang.color || "#888",
                                  }}
                                  aria-hidden="true"
                                />
                                <span className="text-body text-text-primary font-medium">
                                  {lang.name}
                                </span>
                              </div>
                              <span className="text-body-sm text-text-muted">
                                {lang.percentage}%
                              </span>
                            </div>
                            <motion.div
                              className="h-2 bg-space-deep rounded-full overflow-hidden"
                              variants={languageBarVariants}
                              initial="hidden"
                              animate="visible"
                              custom={index}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: lang.color || "#888",
                                  width: `${lang.percentage}%`,
                                  transformOrigin: "left",
                                }}
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                  duration: 0.8,
                                  delay: 0.5 + index * 0.1,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                              />
                            </motion.div>
                          </div>
                        ))}
                    </div>

                    {/* All languages as chips */}
                    <div className="flex flex-wrap gap-3 pl-6">
                      {project.languages.map((lang, index) => (
                        <motion.div
                          key={lang.name}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-deep border border-maroon-primary/30 hover:border-maroon-neon/50 transition-colors"
                          custom={index}
                          variants={chipVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ scale: 1.05 }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: lang.color || "#888" }}
                            aria-hidden="true"
                          />
                          <span className="text-body-sm text-text-primary">
                            {lang.name}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Topics Section */}
                {project.topics && project.topics.length > 0 && (
                  <motion.div
                    className="mb-8"
                    custom={3}
                    variants={contentSectionVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <h3 className="text-heading-3 font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <span className="text-maroon-neon">▸</span>
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {project.topics.map((topic, index) => (
                        <motion.span
                          key={topic}
                          className="px-3 py-1 text-body-sm bg-maroon-primary/20 text-maroon-neon rounded-full border border-maroon-neon/30 hover:bg-maroon-primary/30 hover:border-maroon-neon/50 transition-colors cursor-default"
                          custom={index}
                          variants={chipVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ scale: 1.05 }}
                        >
                          #{topic}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Links Section */}
                <motion.div
                  className="flex flex-wrap gap-4"
                  custom={4}
                  variants={contentSectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {/* GitHub Link */}
                  <motion.a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-maroon-primary text-text-primary font-semibold hover:bg-maroon-neon transition-colors focus:outline-none focus:ring-2 focus:ring-maroon-neon focus:ring-offset-2 focus:ring-offset-space-medium"
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>View on GitHub</span>
                    <span aria-hidden="true">→</span>
                  </motion.a>

                  {/* Live Demo Link */}
                  {project.homepage && (
                    <motion.a
                      href={project.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-maroon-neon text-maroon-neon font-semibold hover:bg-maroon-neon hover:text-space-navy transition-colors focus:outline-none focus:ring-2 focus:ring-maroon-neon focus:ring-offset-2 focus:ring-offset-space-medium"
                      whileHover={{ scale: 1.05, x: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>Live Demo</span>
                      <span aria-hidden="true">↗</span>
                    </motion.a>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
