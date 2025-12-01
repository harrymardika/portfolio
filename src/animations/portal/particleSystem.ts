interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
  angle: number;
  angleVelocity: number;
  orbitRadius: number;
  orbitAngle: number;
  orbitSpeed: number;
}

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private centerX: number = 0;
  private centerY: number = 0;
  private time: number = 0;
  private reducedMotion: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    particleCount: number = 80,
    reducedMotion: boolean = false
  ) {
    this.canvas = canvas;
    this.reducedMotion = reducedMotion;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    this.ctx = ctx;
    this.resize();
    this.initParticles(particleCount);

    // Bind resize handler
    window.addEventListener("resize", this.resize.bind(this));
  }

  private resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);

    this.centerX = rect.width / 2;
    this.centerY = rect.height / 2;
  }

  private initParticles(count: number) {
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = 50 + Math.random() * 250;
      const orbitAngle = Math.random() * Math.PI * 2;

      this.particles.push({
        x: this.centerX + Math.cos(angle) * orbitRadius,
        y: this.centerY + Math.sin(angle) * orbitRadius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.5,
        hue: 0 + Math.random() * 30, // Red-orange range
        angle,
        angleVelocity: (Math.random() - 0.5) * 0.02,
        orbitRadius,
        orbitAngle,
        orbitSpeed:
          (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1),
      });
    }
  }

  private updateParticle(particle: Particle, deltaTime: number) {
    if (this.reducedMotion) {
      // Static particles for reduced motion
      return;
    }

    // Orbit around center
    particle.orbitAngle += particle.orbitSpeed * deltaTime;

    const targetX =
      this.centerX + Math.cos(particle.orbitAngle) * particle.orbitRadius;
    const targetY =
      this.centerY + Math.sin(particle.orbitAngle) * particle.orbitRadius;

    // Smooth movement towards orbit position
    particle.x += (targetX - particle.x) * 0.02;
    particle.y += (targetY - particle.y) * 0.02;

    // Add subtle drift
    particle.x += Math.sin(this.time * 0.001 + particle.angle) * 0.3;
    particle.y += Math.cos(this.time * 0.001 + particle.angle) * 0.3;

    // Pulse opacity
    particle.opacity = 0.3 + Math.sin(this.time * 0.002 + particle.angle) * 0.3;

    // Keep particles in bounds with wraparound
    const margin = 50;
    if (particle.x < -margin)
      particle.x = this.canvas.width / (window.devicePixelRatio || 1) + margin;
    if (
      particle.x >
      this.canvas.width / (window.devicePixelRatio || 1) + margin
    )
      particle.x = -margin;
    if (particle.y < -margin)
      particle.y = this.canvas.height / (window.devicePixelRatio || 1) + margin;
    if (
      particle.y >
      this.canvas.height / (window.devicePixelRatio || 1) + margin
    )
      particle.y = -margin;
  }

  private drawParticle(particle: Particle) {
    this.ctx.save();

    // Create gradient for particle glow
    const gradient = this.ctx.createRadialGradient(
      particle.x,
      particle.y,
      0,
      particle.x,
      particle.y,
      particle.size * 3
    );

    // Maroon to gold gradient based on particle hue
    const color = particle.hue < 15 ? "#A71D2A" : "#FFD27F";
    gradient.addColorStop(0, `${color}`);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = gradient;

    // Draw glow
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw core
    this.ctx.globalAlpha = particle.opacity * 1.5;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private drawConnectionLines() {
    if (this.reducedMotion) return;

    // Draw subtle connection lines between nearby particles
    this.ctx.save();
    this.ctx.strokeStyle = "rgba(167, 29, 42, 0.1)";
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 80) {
          this.ctx.globalAlpha = (1 - distance / 80) * 0.2;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.restore();
  }

  public animate() {
    const deltaTime = 16; // Approximate 60fps
    this.time += deltaTime;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle) => {
      this.updateParticle(particle, deltaTime);
      this.drawParticle(particle);
    });

    // Draw connection lines
    this.drawConnectionLines();

    // Continue animation
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  public start() {
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  public stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public setReducedMotion(value: boolean) {
    this.reducedMotion = value;
  }

  public destroy() {
    this.stop();
    window.removeEventListener("resize", this.resize.bind(this));
  }
}
