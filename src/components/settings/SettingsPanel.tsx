interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  reducedMotion?: boolean;
  onReducedMotionChange?: (value: boolean) => void;
  highContrast?: boolean;
  onHighContrastChange?: (value: boolean) => void;
  particleDensity?: "low" | "medium" | "high";
  onParticleDensityChange?: (value: "low" | "medium" | "high") => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  reducedMotion = false,
  onReducedMotionChange,
  highContrast = false,
  onHighContrastChange,
  particleDensity = "medium",
  onParticleDensityChange,
}: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-space-navy/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-space-medium border border-maroon-primary/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-maroon-primary/20">
          <h2
            id="settings-title"
            className="text-heading-2 font-bold text-text-primary"
          >
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-space-deep transition-colors"
            aria-label="Close settings"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Accessibility Section */}
          <section>
            <h3 className="text-heading-3 font-semibold text-text-primary mb-4">
              Accessibility
            </h3>

            {/* Reduced Motion Toggle */}
            <label className="flex items-center justify-between py-3 cursor-pointer group">
              <div>
                <span className="text-body text-text-primary group-hover:text-maroon-neon transition-colors">
                  Reduced Motion
                </span>
                <p className="text-body-sm text-text-muted mt-1">
                  Minimize animations for better focus
                </p>
              </div>
              <button
                role="switch"
                aria-checked={reducedMotion}
                onClick={() => onReducedMotionChange?.(!reducedMotion)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  reducedMotion ? "bg-maroon-neon" : "bg-space-deep"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-text-primary transition-transform ${
                    reducedMotion ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            {/* High Contrast Toggle */}
            <label className="flex items-center justify-between py-3 cursor-pointer group">
              <div>
                <span className="text-body text-text-primary group-hover:text-maroon-neon transition-colors">
                  High Contrast
                </span>
                <p className="text-body-sm text-text-muted mt-1">
                  Increase color contrast for better visibility
                </p>
              </div>
              <button
                role="switch"
                aria-checked={highContrast}
                onClick={() => onHighContrastChange?.(!highContrast)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  highContrast ? "bg-maroon-neon" : "bg-space-deep"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-text-primary transition-transform ${
                    highContrast ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </section>

          {/* Visual Effects Section */}
          <section>
            <h3 className="text-heading-3 font-semibold text-text-primary mb-4">
              Visual Effects
            </h3>

            {/* Particle Density */}
            <div className="py-3">
              <label className="text-body text-text-primary mb-3 block">
                Particle Density
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => onParticleDensityChange?.(density)}
                    className={`flex-1 px-4 py-2 rounded-lg text-body-sm font-medium transition-colors ${
                      particleDensity === density
                        ? "bg-maroon-neon text-space-navy"
                        : "bg-space-deep text-text-secondary hover:text-text-primary hover:bg-space-deep/80"
                    }`}
                  >
                    {density.charAt(0).toUpperCase() + density.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-body-sm text-text-muted mt-2">
                Adjust background particle count for performance
              </p>
            </div>
          </section>

          {/* Reset Section */}
          <section className="pt-4 border-t border-maroon-primary/20">
            <button
              onClick={() => {
                onReducedMotionChange?.(false);
                onHighContrastChange?.(false);
                onParticleDensityChange?.("medium");
              }}
              className="w-full px-4 py-3 rounded-lg text-body text-maroon-neon border border-maroon-neon/30 hover:bg-maroon-neon/10 transition-colors"
            >
              Reset to Defaults
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
