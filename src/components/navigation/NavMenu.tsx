import { useState } from "react";

interface NavMenuProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function NavMenu({
  currentPath = "/",
  onNavigate,
  className = "",
}: NavMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Portal" },
    { path: "/timeline", label: "Timeline" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const handleNavClick = (path: string) => {
    onNavigate?.(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`relative ${className}`} aria-label="Main navigation">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavClick(item.path)}
            className={`text-body font-medium transition-colors relative group ${
              currentPath === item.path
                ? "text-maroon-neon"
                : "text-text-secondary hover:text-text-primary"
            }`}
            aria-current={currentPath === item.path ? "page" : undefined}
          >
            {item.label}

            {/* Active Indicator */}
            {currentPath === item.path && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-maroon-neon" />
            )}

            {/* Hover Indicator */}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-text-primary transition-all group-hover:w-full" />
          </button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-text-primary hover:text-maroon-neon transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isMobileMenuOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-space-medium border border-maroon-primary/30 rounded-lg shadow-lg overflow-hidden md:hidden">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full text-left px-4 py-3 text-body transition-colors ${
                currentPath === item.path
                  ? "bg-maroon-primary/20 text-maroon-neon"
                  : "text-text-secondary hover:bg-space-deep hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
