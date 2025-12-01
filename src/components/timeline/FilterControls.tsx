import { useState } from "react";

interface FilterControlsProps {
  tags?: string[];
  activeTags?: string[];
  years?: number[];
  activeYears?: number[];
  onTagToggle?: (tag: string) => void;
  onYearToggle?: (year: number) => void;
  onReset?: () => void;
  className?: string;
}

export default function FilterControls({
  tags = [],
  activeTags = [],
  years = [],
  activeYears = [],
  onTagToggle,
  onYearToggle,
  onReset,
  className = "",
}: FilterControlsProps) {
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [showYearsDropdown, setShowYearsDropdown] = useState(false);

  const hasActiveFilters = activeTags.length > 0 || activeYears.length > 0;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Tag Filters Dropdown */}
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-medium border border-maroon-primary/30 text-text-primary hover:border-maroon-neon/50 transition-colors"
          aria-label="Filter by tags"
          onClick={() => setShowTagsDropdown(!showTagsDropdown)}
          aria-expanded={showTagsDropdown}
        >
          <span className="text-body">Tags</span>
          {activeTags.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-maroon-neon text-space-navy text-body-sm font-semibold">
              {activeTags.length}
            </span>
          )}
          <span aria-hidden="true">▼</span>
        </button>

        {/* Dropdown Menu */}
        {showTagsDropdown && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-space-medium border border-maroon-primary/30 rounded-lg shadow-lg p-4 z-50">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tags.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 cursor-pointer hover:bg-space-deep px-2 py-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeTags.includes(tag)}
                    onChange={() => onTagToggle?.(tag)}
                    className="rounded border-maroon-primary text-maroon-neon focus:ring-maroon-neon"
                  />
                  <span className="text-body text-text-secondary">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Year Filters Dropdown */}
      <div className="relative">
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-space-medium border border-maroon-primary/30 text-text-primary hover:border-maroon-neon/50 transition-colors"
          aria-label="Filter by year"
          onClick={() => setShowYearsDropdown(!showYearsDropdown)}
          aria-expanded={showYearsDropdown}
        >
          <span className="text-body">Years</span>
          {activeYears.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-maroon-neon text-space-navy text-body-sm font-semibold">
              {activeYears.length}
            </span>
          )}
          <span aria-hidden="true">▼</span>
        </button>

        {/* Dropdown Menu */}
        {showYearsDropdown && (
          <div className="absolute top-full mt-2 right-0 w-48 bg-space-medium border border-maroon-primary/30 rounded-lg shadow-lg p-4 z-50">
            <div className="space-y-2">
              {years.map((year) => (
                <label
                  key={year}
                  className="flex items-center gap-2 cursor-pointer hover:bg-space-deep px-2 py-1 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeYears.includes(year)}
                    onChange={() => onYearToggle?.(year)}
                    className="rounded border-maroon-primary text-maroon-neon focus:ring-maroon-neon"
                  />
                  <span className="text-body text-text-secondary font-mono">
                    {year}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={() => {
            onReset?.();
            setShowTagsDropdown(false);
            setShowYearsDropdown(false);
          }}
          className="px-4 py-2 rounded-lg text-body text-maroon-neon border border-maroon-neon/30 hover:bg-maroon-neon/10 transition-colors"
          aria-label="Reset filters"
        >
          Reset
        </button>
      )}

      {/* Active Filter Count */}
      {hasActiveFilters && (
        <div className="text-body-sm text-text-muted">
          {activeTags.length + activeYears.length} active filter
          {activeTags.length + activeYears.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
