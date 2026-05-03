import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  flickerSpeed: number;
  hue: number;
  // Cached gradient (size & hue are constant per particle)
  coreColorBase: string;
  glowStop0: string;
  glowStop04: string;
  glowStop1: string;
}

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Respect reduced-motion preference: render one static frame, no loop.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Cap DPR to 1 — particles are soft glows, no benefit from hi-DPI sharpness,
    // and overdraw cost scales with DPR^2.
    const DPR = 1;

    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const resize = () => {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = cssWidth * DPR;
      canvas.height = cssHeight * DPR;
    };
    resize();

    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    // Create firefly particles. Pre-compute color strings to avoid
    // per-frame string concatenation and gradient color-stop parsing.
    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    particles.current = Array.from({ length: count }, () => {
      const hue = Math.random() > 0.5 ? 40 : 350;
      return {
        x: Math.random() * cssWidth,
        y: Math.random() * cssHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        flickerSpeed: Math.random() * 0.02 + 0.005,
        hue,
        coreColorBase: `hsla(${hue}, 90%, 75%,`,
        glowStop0: `hsla(${hue}, 78%, 52%,`,
        glowStop04: `hsla(${hue}, 60%, 45%,`,
        glowStop1: `hsla(${hue}, 50%, 40%, 0)`,
      };
    });

    let time = 0;
    let running = true;
    let inView = true;

    // Pause when tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
      } else if (inView && !running) {
        running = true;
        loop();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Pause when canvas is scrolled off-screen (it's position:fixed and full
    // viewport, so this mainly catches edge cases / future layout changes).
    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            inView = e.isIntersecting;
            if (!inView) {
              running = false;
            } else if (!document.hidden && !running) {
              running = true;
              loop();
            }
          }
        },
        { threshold: 0 }
      );
      observer.observe(canvas);
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      const list = particles.current;
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        p.x += p.speedX + Math.sin(time * 0.01 + p.y * 0.01) * 0.3;
        p.y += p.speedY + Math.cos(time * 0.008 + p.x * 0.01) * 0.2;

        // Wrap around
        if (p.x < 0) p.x = cssWidth;
        else if (p.x > cssWidth) p.x = 0;
        if (p.y < 0) p.y = cssHeight;
        else if (p.y > cssHeight) p.y = 0;

        // Flicker
        const flicker = Math.sin(time * p.flickerSpeed) * 0.3 + 0.5;
        const alpha = p.opacity * flicker;
        const glowR = p.size * 6;

        // Glow gradient — gradients can't be cached because center moves,
        // but reusing pre-built color string prefixes avoids template-literal
        // allocations every frame.
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
        gradient.addColorStop(0, `${p.glowStop0}${alpha})`);
        gradient.addColorStop(0.4, `${p.glowStop04}${alpha * 0.3})`);
        gradient.addColorStop(1, p.glowStop1);

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `${p.coreColorBase}${alpha})`;
        ctx.fill();
      }
    };

    // Throttle to ~30fps — fireflies drift slowly, 60fps is wasted work.
    const FRAME_MS = 1000 / 30;
    let lastTs = 0;
    const loop = (ts?: number) => {
      if (!running) return;
      const now = ts ?? performance.now();
      if (now - lastTs >= FRAME_MS) {
        lastTs = now;
        drawFrame();
      }
      animRef.current = requestAnimationFrame(loop);
    };

    if (prefersReducedMotion) {
      drawFrame(); // single static frame, no animation loop
    } else {
      loop();
    }

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  );
};

export default ParticleField;
