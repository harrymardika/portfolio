import WarpBackground from "@/components/portal/WarpBackground";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-space-navy">
      {/* Background */}
      <div className="fixed inset-0 z-background">
        <WarpBackground
          density="medium"
          speed="slow"
          enableParallax={true}
          enableDistortion={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="py-8 px-4 border-b border-maroon-primary/20">
          <div className="container mx-auto">
            <h1 className="text-heading-1 font-bold text-text-primary">
              About
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Intro Section */}
            <section>
              <div className="bg-space-medium/50 backdrop-blur-sm border border-maroon-primary/30 rounded-xl p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar Placeholder */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-maroon-neon to-maroon-dark flex items-center justify-center text-4xl">
                    👨‍💻
                  </div>

                  <div className="flex-1">
                    <h2 className="text-heading-2 font-bold text-text-primary mb-2">
                      Harry Mardika
                    </h2>
                    <p className="text-body text-maroon-neon font-mono mb-4">
                      Full Stack Developer | Temporal Portal Engineer
                    </p>
                    <p className="text-body text-text-secondary leading-relaxed">
                      Welcome to my temporal dimension! I'm a developer
                      passionate about creating immersive web experiences that
                      blend technology with storytelling.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <section>
              <h2 className="text-heading-2 font-bold text-text-primary mb-6">
                Technical Arsenal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    category: "Frontend",
                    skills: ["React", "TypeScript", "Tailwind CSS"],
                  },
                  {
                    category: "Backend",
                    skills: ["Node.js", "Bun", "GraphQL"],
                  },
                  {
                    category: "Animation",
                    skills: ["Framer Motion", "Canvas", "WebGL"],
                  },
                  {
                    category: "Tools",
                    skills: ["Git", "Vite", "GitHub Actions"],
                  },
                ].map((group) => (
                  <div
                    key={group.category}
                    className="bg-space-medium/50 border border-maroon-primary/30 rounded-lg p-6"
                  >
                    <h3 className="text-heading-3 font-semibold text-maroon-neon mb-3">
                      {group.category}
                    </h3>
                    <ul className="space-y-2">
                      {group.skills.map((skill) => (
                        <li
                          key={skill}
                          className="text-body text-text-secondary flex items-center gap-2"
                        >
                          <span className="text-maroon-neon">▸</span>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline Preview */}
            <section>
              <h2 className="text-heading-2 font-bold text-text-primary mb-6">
                Journey Through Time
              </h2>
              <div className="bg-space-medium/50 border border-maroon-primary/30 rounded-lg p-8 text-center">
                <p className="text-body text-text-secondary mb-6">
                  Explore my projects and experience across the temporal layers
                </p>
                <button className="px-6 py-3 rounded-lg bg-maroon-primary text-text-primary font-semibold hover:bg-maroon-neon transition-colors">
                  View Timeline →
                </button>
              </div>
            </section>

            {/* Philosophy Section */}
            <section>
              <h2 className="text-heading-2 font-bold text-text-primary mb-6">
                Development Philosophy
              </h2>
              <div className="bg-space-medium/50 border border-maroon-primary/30 rounded-lg p-8">
                <blockquote className="text-body text-text-secondary italic leading-relaxed border-l-4 border-maroon-neon pl-6">
                  "Code is not just about functionality—it's about crafting
                  experiences that resonate, inspire, and push the boundaries of
                  what's possible on the web."
                </blockquote>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
