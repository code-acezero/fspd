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
}

const ParticleField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      // Use viewport size instead of scrollHeight to avoid forced reflow
      // (canvas is position: fixed, so viewport coverage is sufficient)
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    };
    window.addEventListener("resize", onResize);

    // Create firefly particles
    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    particles.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      flickerSpeed: Math.random() * 0.02 + 0.005,
      hue: Math.random() > 0.5 ? 40 : 350, // gold or crimson
    }));

    let time = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      particles.current.forEach((p) => {
        p.x += p.speedX + Math.sin(time * 0.01 + p.y * 0.01) * 0.3;
        p.y += p.speedY + Math.cos(time * 0.008 + p.x * 0.01) * 0.2;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Flicker
        const flicker = Math.sin(time * p.flickerSpeed) * 0.3 + 0.5;
        const alpha = p.opacity * flicker;

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
        gradient.addColorStop(0, `hsla(${p.hue}, 78%, 52%, ${alpha})`);
        gradient.addColorStop(0.4, `hsla(${p.hue}, 60%, 45%, ${alpha * 0.3})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 50%, 40%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${alpha})`;
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ParticleField;
