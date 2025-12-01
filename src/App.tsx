import { useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import PortalLanding from "./components/portal/PortalLanding";
import TimelinePage from "./components/timeline/TimelinePage";
import TimeLayer from "./components/timeline/TimeLayer";
import ProjectNode from "./components/project/ProjectNode";
import ProjectModal from "./components/project/ProjectModal";
import AccessibilityPanel from "./components/ui/AccessibilityPanel";
import { useAppStore } from "./store/useAppStore";
import { useThemeManager } from "./hooks/useThemeManager";
import {
  useKeyboardNav,
  useAccessibilityShortcuts,
} from "./hooks/useKeyboardNav";
import { playSound } from "./lib/sound";
import type { Project } from "./types";

// Sample project data for demonstration
const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Temporal Portal Portfolio",
    slug: "temporal-portal",
    description:
      "An interactive portfolio with cinematic portal animations and time-warp effects",
    url: "https://github.com/user/temporal-portal",
    stars: 42,
    topics: ["react", "typescript", "framer-motion", "tailwind"],
    languages: [{ name: "TypeScript", color: "#3178c6" }],
    updatedAt: "2025-01-15",
    year: 2025,
  },
  {
    id: "2",
    name: "Neural Network Visualizer",
    slug: "neural-viz",
    description:
      "Real-time visualization of neural network training with WebGL shaders",
    url: "https://github.com/user/neural-viz",
    stars: 128,
    topics: ["webgl", "machine-learning", "visualization"],
    languages: [{ name: "JavaScript", color: "#f1e05a" }],
    updatedAt: "2024-11-20",
    year: 2024,
  },
  {
    id: "3",
    name: "Quantum State Simulator",
    slug: "quantum-sim",
    description:
      "Quantum computing simulator with interactive Bloch sphere visualization",
    url: "https://github.com/user/quantum-sim",
    stars: 89,
    topics: ["quantum", "physics", "simulation"],
    languages: [{ name: "Python", color: "#3572A5" }],
    updatedAt: "2024-09-10",
    year: 2024,
  },
  {
    id: "4",
    name: "Distributed Task Scheduler",
    slug: "task-scheduler",
    description:
      "High-performance distributed task scheduling system with Redis backend",
    url: "https://github.com/user/task-scheduler",
    stars: 201,
    topics: ["distributed-systems", "redis", "golang"],
    languages: [{ name: "Go", color: "#00ADD8" }],
    updatedAt: "2023-12-05",
    year: 2023,
  },
  {
    id: "5",
    name: "Blockchain Explorer",
    slug: "chain-explorer",
    description:
      "Multi-chain blockchain explorer with real-time transaction monitoring",
    url: "https://github.com/user/chain-explorer",
    stars: 156,
    topics: ["blockchain", "web3", "ethereum"],
    languages: [{ name: "Rust", color: "#dea584" }],
    updatedAt: "2023-08-22",
    year: 2023,
  },
];

// Group projects by year
const projectsByYear = sampleProjects.reduce((acc, project) => {
  if (!acc[project.year]) {
    acc[project.year] = [];
  }
  acc[project.year].push(project);
  return acc;
}, {} as Record<number, Project[]>);

const years = Object.keys(projectsByYear)
  .map(Number)
  .sort((a, b) => b - a); // Descending order

function App() {
  const [isTimelineActive, setIsTimelineActive] = useState(false);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] =
    useState(false);
  const appContainerRef = useRef<HTMLDivElement>(null);
  const { selectedProject, isModalOpen, openModal, closeModal } = useAppStore();

  // Initialize theme manager
  useThemeManager();

  // Keyboard navigation for projects
  useKeyboardNav({
    projects: sampleProjects,
    enabled: isTimelineActive,
  });

  // Accessibility shortcuts
  useAccessibilityShortcuts(() =>
    setIsAccessibilityPanelOpen(!isAccessibilityPanelOpen)
  );

  // Use scroll to manage portal exit animation smoothly
  const { scrollY } = useScroll();
  const portalOpacity = useTransform(scrollY, [0, 100, 200], [1, 0.5, 0], {
    clamp: false,
  });
  const portalScale = useTransform(scrollY, [0, 100, 200], [1, 1.1, 1.3], {
    clamp: false,
  });

  const handleEnterTimeline = () => {
    console.log("Entering timeline...");
    playSound("portalEnter");
    setIsTimelineActive(true);
  };

  const handleScrollToExplore = () => {
    console.log("Scroll to explore triggered - transitioning to timeline");
    playSound("portalEnter");
    setIsTimelineActive(true);
  };

  const handleProjectClick = (project: Project) => {
    console.log("Project clicked:", project.name);
    playSound("projectOpen");
    openModal(project);
  };

  const handleBackToPortal = () => {
    playSound("back");
    setIsTimelineActive(false);
  };

  return (
    <div
      ref={appContainerRef}
      className="w-full h-screen overflow-hidden"
      style={{ display: "flex", flexDirection: "column" }}
    >
      {/* Accessibility Panel */}
      <AccessibilityPanel
        isOpen={isAccessibilityPanelOpen}
        onClose={() => setIsAccessibilityPanelOpen(false)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          overflow: isTimelineActive ? "auto" : "hidden",
        }}
      >
        <AnimatePresence mode="sync">
          {!isTimelineActive ? (
            <motion.div
              key="portal"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
              style={{
                opacity: portalOpacity,
                scale: portalScale,
              }}
            >
              <PortalLanding
                onEnterTimeline={handleEnterTimeline}
                onScrollToExplore={handleScrollToExplore}
              />
            </motion.div>
          ) : (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full h-full"
            >
              <TimelinePage
                onScroll={(progress) =>
                  console.log(
                    "Scroll progress:",
                    Math.round(progress * 100) + "%"
                  )
                }
                onBackToPortal={handleBackToPortal}
                onAccessibilityClick={() => setIsAccessibilityPanelOpen(true)}
              >
                {/* Render time layers for each year */}
                {years.map((year) => (
                  <TimeLayer
                    key={year}
                    year={year}
                    projects={projectsByYear[year]}
                  >
                    {projectsByYear[year].map((project) => (
                      <ProjectNode
                        key={project.id}
                        project={project}
                        onClick={handleProjectClick}
                        index={sampleProjects.findIndex(
                          (p) => p.id === project.id
                        )}
                      />
                    ))}
                  </TimeLayer>
                ))}
              </TimelinePage>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Project Modal - Rendered outside timeline for proper z-index */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default App;
