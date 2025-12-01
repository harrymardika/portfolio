import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { playSound } from "@/lib/sound";

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityPanel({
  isOpen,
  onClose,
}: AccessibilityPanelProps) {
  const {
    accessibility,
    setReducedMotion,
    setHighContrast,
    setKeyboardNavEnabled,
    setSoundEnabled,
  } = useAppStore();

  const panelVariants = {
    hidden: { opacity: 0, x: 300, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      x: 300,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
    icon,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description: string;
    icon: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-label={label}>
            {icon}
          </span>
          <div>
            <label className="text-body font-medium text-text-primary">
              {label}
            </label>
            <p className="text-body-sm text-text-secondary">{description}</p>
          </div>
        </div>
        <button
          onClick={() => {
            playSound("click");
            onChange(!enabled);
          }}
          className={`
            relative w-14 h-7 rounded-full transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-gold-highlight focus:ring-offset-2 
            focus:ring-offset-space-navy
            ${enabled ? "bg-maroon-neon" : "bg-space-medium"}
          `}
          role="switch"
          aria-checked={enabled}
          aria-label={`Toggle ${label}`}
        >
          <motion.div
            className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
            animate={{ x: enabled ? 24 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-modal"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-4 top-4 bottom-4 w-full max-w-md bg-space-deep/95 
                     backdrop-blur-portal border border-maroon-primary/30 rounded-lg 
                     shadow-2xl z-modal overflow-y-auto custom-scrollbar"
          >
            {/* Header */}
            <div className="sticky top-0 bg-space-deep/95 backdrop-blur-md border-b border-maroon-primary/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-heading-2 font-bold text-text-primary">
                    Accessibility
                  </h2>
                  <p className="text-body-sm text-text-secondary mt-1">
                    Customize your experience
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-space-medium hover:bg-maroon-primary/20
                           transition-colors duration-200 flex items-center justify-center
                           focus:outline-none focus:ring-2 focus:ring-gold-highlight"
                  aria-label="Close accessibility panel"
                >
                  <svg
                    className="w-6 h-6 text-text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* Motion Settings */}
              <section>
                <h3 className="text-heading-3 font-semibold text-text-primary mb-4">
                  Motion
                </h3>
                <ToggleSwitch
                  enabled={accessibility.reducedMotion}
                  onChange={setReducedMotion}
                  label="Reduced Motion"
                  description="Minimize animations and transitions"
                  icon="🎬"
                />
              </section>

              {/* Visual Settings */}
              <section>
                <h3 className="text-heading-3 font-semibold text-text-primary mb-4">
                  Visual
                </h3>
                <ToggleSwitch
                  enabled={accessibility.highContrast}
                  onChange={setHighContrast}
                  label="High Contrast"
                  description="Enhanced colors for better readability"
                  icon="🎨"
                />
              </section>

              {/* Navigation Settings */}
              <section>
                <h3 className="text-heading-3 font-semibold text-text-primary mb-4">
                  Navigation
                </h3>
                <ToggleSwitch
                  enabled={accessibility.keyboardNavEnabled}
                  onChange={setKeyboardNavEnabled}
                  label="Keyboard Navigation"
                  description="Enable Tab and Enter key controls"
                  icon="⌨️"
                />
              </section>

              {/* Audio Settings */}
              <section>
                <h3 className="text-heading-3 font-semibold text-text-primary mb-4">
                  Audio
                </h3>
                <ToggleSwitch
                  enabled={accessibility.soundEnabled}
                  onChange={setSoundEnabled}
                  label="Sound Effects"
                  description="Portal ambience and UI sounds"
                  icon="🔊"
                />
              </section>

              {/* Info Section */}
              <section className="mt-8 p-4 bg-space-medium/50 border border-maroon-primary/20 rounded-lg">
                <h4 className="text-body font-semibold text-text-primary mb-2">
                  ℹ️ Keyboard Shortcuts
                </h4>
                <ul className="text-body-sm text-text-secondary space-y-1">
                  <li>
                    <kbd className="px-2 py-1 bg-space-navy rounded text-xs font-mono">
                      Tab
                    </kbd>{" "}
                    - Navigate between projects
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-space-navy rounded text-xs font-mono">
                      Enter
                    </kbd>{" "}
                    - Open project details
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-space-navy rounded text-xs font-mono">
                      Esc
                    </kbd>{" "}
                    - Close modal
                  </li>
                  <li>
                    <kbd className="px-2 py-1 bg-space-navy rounded text-xs font-mono">
                      A
                    </kbd>{" "}
                    - Open accessibility panel
                  </li>
                </ul>
              </section>

              {/* WCAG Compliance Notice */}
              <section className="text-body-sm text-text-muted text-center">
                <p>
                  This site aims to meet{" "}
                  <span className="text-gold-highlight font-semibold">
                    WCAG 2.1 AA
                  </span>{" "}
                  standards
                </p>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
