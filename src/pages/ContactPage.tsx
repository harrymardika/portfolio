import { useState } from "react";
import WarpBackground from "@/components/portal/WarpBackground";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");

    // Simulate form submission
    setTimeout(() => {
      try {
        // In production, send to backend or email service
        console.log("Form submitted:", formData);

        // Show success message
        setSubmitStatus("success");
        setFormData({ name: "", email: "", message: "" });

        // Reset success message after 3 seconds
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 3000);
      } catch (error) {
        setSubmitStatus("error");
        setErrorMessage("Failed to send message. Please try again.");
        setTimeout(() => {
          setSubmitStatus("idle");
        }, 3000);
      }
    }, 1000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
              Contact
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-heading-2 font-bold text-text-primary mb-4">
                    Get In Touch
                  </h2>
                  <p className="text-body text-text-secondary leading-relaxed">
                    Interested in collaborating or have questions about my work?
                    Feel free to reach out through the form or via the links
                    below.
                  </p>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  {[
                    {
                      label: "GitHub",
                      icon: "💻",
                      href: "https://github.com/maybeitsai",
                    },
                    { label: "LinkedIn", icon: "💼", href: "#" },
                    {
                      label: "Email",
                      icon: "📧",
                      href: "mailto:contact@example.com",
                    },
                    { label: "Twitter", icon: "🐦", href: "#" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-space-medium/50 border border-maroon-primary/30 rounded-lg hover:border-maroon-neon/50 transition-colors group"
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span className="text-body text-text-secondary group-hover:text-text-primary transition-colors">
                        {link.label}
                      </span>
                      <span className="ml-auto text-maroon-neon opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-space-medium/50 border border-maroon-primary/30 rounded-xl p-6 space-y-6">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-body text-text-primary mb-2"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-space-deep border border-maroon-primary/30 rounded-lg text-text-primary focus:border-maroon-neon focus:outline-none focus:ring-2 focus:ring-maroon-neon/50 transition-colors"
                        placeholder="Your name"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-body text-text-primary mb-2"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-space-deep border border-maroon-primary/30 rounded-lg text-text-primary focus:border-maroon-neon focus:outline-none focus:ring-2 focus:ring-maroon-neon/50 transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-body text-text-primary mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-space-deep border border-maroon-primary/30 rounded-lg text-text-primary focus:border-maroon-neon focus:outline-none focus:ring-2 focus:ring-maroon-neon/50 transition-colors resize-none"
                        placeholder="Tell me about your project or inquiry..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full px-6 py-3 rounded-lg bg-maroon-primary text-text-primary font-semibold hover:bg-maroon-neon transition-colors focus:outline-none focus:ring-2 focus:ring-maroon-neon focus:ring-offset-2 focus:ring-offset-space-medium"
                    >
                      Send Message
                    </button>
                  </div>
                </form>

                {/* Success/Error Message */}
                {submitStatus !== "idle" && (
                  <div
                    className={`mt-4 p-4 rounded-lg border text-body-sm ${
                      submitStatus === "success"
                        ? "bg-green-950/20 border-green-600/30 text-green-300"
                        : submitStatus === "error"
                        ? "bg-red-950/20 border-red-600/30 text-red-300"
                        : "bg-maroon-primary/10 border-maroon-neon/30 text-maroon-neon"
                    }`}
                  >
                    {submitStatus === "loading" && "Sending..."}
                    {submitStatus === "success" &&
                      "✓ Message sent successfully!"}
                    {submitStatus === "error" && `✕ ${errorMessage}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
