/**
 * README Renderer Component
 *
 * Renders markdown README content with syntax highlighting
 * Future enhancement: Fetch README from GitHub API
 */

import { motion } from "framer-motion";
import { contentSectionVariants } from "@/animations/modal/modalTransitions";

interface ReadmeRendererProps {
  content?: string;
}

export default function ReadmeRenderer({ content }: ReadmeRendererProps) {
  // If no content provided, show placeholder
  if (!content) {
    return (
      <motion.div
        className="mb-8"
        custom={4}
        variants={contentSectionVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-heading-3 font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-maroon-neon">▸</span>
          README
        </h3>
        <div className="pl-6 border-l-2 border-maroon-primary/30">
          <div className="p-6 rounded-lg bg-space-deep/50 border border-maroon-primary/20">
            <p className="text-body text-text-muted italic">
              README content will be fetched from GitHub in a future update.
            </p>
            <p className="text-body-sm text-text-muted mt-2">
              Visit the repository to view the complete documentation.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Simple markdown rendering (basic version)
  // TODO: Add proper markdown parser like marked or react-markdown
  const renderContent = () => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split("\n\n");

    return paragraphs.map((para, index) => {
      // Check if it's a heading
      if (para.startsWith("# ")) {
        return (
          <h4
            key={index}
            className="text-heading-3 font-bold text-text-primary mb-3 mt-6 first:mt-0"
          >
            {para.substring(2)}
          </h4>
        );
      }

      if (para.startsWith("## ")) {
        return (
          <h5
            key={index}
            className="text-body font-semibold text-text-primary mb-2 mt-4"
          >
            {para.substring(3)}
          </h5>
        );
      }

      // Check if it's a code block
      if (para.startsWith("```")) {
        const lines = para.split("\n");
        // const language = lines[0].substring(3); // Future: use for syntax highlighting
        const code = lines.slice(1, -1).join("\n");

        return (
          <pre
            key={index}
            className="p-4 rounded-lg bg-space-navy/80 border border-maroon-primary/20 overflow-x-auto my-4"
          >
            <code className="text-body-sm text-text-secondary font-mono">
              {code}
            </code>
          </pre>
        );
      }

      // Regular paragraph
      return (
        <p
          key={index}
          className="text-body text-text-secondary leading-relaxed mb-4"
        >
          {para}
        </p>
      );
    });
  };

  return (
    <motion.div
      className="mb-8"
      custom={4}
      variants={contentSectionVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-heading-3 font-semibold text-text-primary mb-4 flex items-center gap-2">
        <span className="text-maroon-neon">▸</span>
        README
      </h3>
      <div className="pl-6 border-l-2 border-maroon-primary/30">
        <div className="prose prose-invert max-w-none">{renderContent()}</div>
      </div>
    </motion.div>
  );
}
