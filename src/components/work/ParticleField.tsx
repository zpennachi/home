"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";

/**
 * Organic Data Field — a deep-tech ambient particle system.
 * 
 * No connected dots. Instead: flowing, undulating particles that move
 * like data streams through a neural substrate. Subtle mouse reactivity
 * creates gentle ripples in the field. Particles vary in size, opacity,
 * and speed — some drift slowly like deep-ocean plankton, others streak
 * like data packets across fiber optic lines.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  baseOpacity: number;
  color: string;
  baseChar: string;
  hoverChar: string;
  isHovered: boolean;
  phase: number;
  phaseSpeed: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
  layer: number; // 0 = deep/slow, 1 = mid, 2 = fast/bright
}

// Simple 2D value noise for organic movement
function noise2D(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  // Smootherstep
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  // Hash corners
  const h = (a: number, b: number) => {
    let n = a * 127.1 + b * 311.7;
    n = Math.sin(n) * 43758.5453;
    return n - Math.floor(n);
  };
  const n00 = h(ix, iy);
  const n10 = h(ix + 1, iy);
  const n01 = h(ix, iy + 1);
  const n11 = h(ix + 1, iy + 1);
  return n00 * (1 - sx) * (1 - sy) + n10 * sx * (1 - sy) + n01 * (1 - sx) * sy + n11 * sx * sy;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const timeRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current.x = e.clientX - rect.left;
    mouseRef.current.y = e.clientY - rect.top;
    mouseRef.current.active = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const PARTICLE_COUNT = 300;
    const MOUSE_RADIUS = 250;
    const MOUSE_FORCE = 1.2;
    const NOISE_SCALE = 0.003;
    const TIME_SPEED = 0.0003;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = canvas!.offsetWidth * dpr;
      canvas!.height = canvas!.offsetHeight * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      const particles: Particle[] = [];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Three layers: deep (60%), mid (30%), fast (10%)
        const r = Math.random();
        const layer = r < 0.6 ? 0 : r < 0.9 ? 1 : 2;

        const baseRadius = layer === 0
          ? Math.random() * 1.0 + 0.5
          : layer === 1
            ? Math.random() * 1.5 + 0.8
            : Math.random() * 2.0 + 1.2;

        const baseOpacity = layer === 0
          ? Math.random() * 0.15 + 0.05
          : layer === 1
            ? Math.random() * 0.2 + 0.1
            : Math.random() * 0.35 + 0.15;

        // Neural / Data stream color palette
        const colors = isDark
          ? [
            [14, 165, 233],  // Cyber blue
            [139, 92, 246],  // Deep purple
            [45, 212, 191],  // Teal
            [248, 250, 252]  // Off white
          ]
          : [
            [2, 132, 199],   // Deep blue
            [124, 58, 237],  // Purple
            [13, 148, 136],  // Deep teal
            [15, 23, 42]     // Off black
          ];

        const c = colors[Math.floor(Math.random() * colors.length)];
        const colorStr = `${c[0]}, ${c[1]}, ${c[2]}`;

        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          radius: baseRadius,
          baseRadius,
          opacity: baseOpacity,
          baseOpacity,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: (Math.random() * 0.5 + 0.5) * (layer === 0 ? 0.3 : layer === 1 ? 0.6 : 1.0),
          noiseOffsetX: Math.random() * 1000,
          noiseOffsetY: Math.random() * 1000,
          color: colorStr,
          baseChar: Math.random() < 0.5 ? "0" : "1",
          hoverChar: Math.random() < 0.5 ? "Z" : "P",
          isHovered: false,
          layer,
        });
      }
      particlesRef.current = particles;
    }

    resize();
    initParticles();

    const onResize = () => { resize(); initParticles(); };
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    function animate() {
      const w = canvas!.offsetWidth;
      const h = canvas!.offsetHeight;
      timeRef.current += 1;
      const t = timeRef.current * TIME_SPEED;

      ctx!.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (const p of particles) {
        // Organic noise-driven movement
        const noiseX = noise2D(
          p.x * NOISE_SCALE + p.noiseOffsetX + t * p.phaseSpeed,
          p.y * NOISE_SCALE + t * 0.5
        );
        const noiseY = noise2D(
          p.x * NOISE_SCALE + t * 0.3,
          p.y * NOISE_SCALE + p.noiseOffsetY + t * p.phaseSpeed
        );

        // Map noise to velocity — creates flowing, undulating motion
        const speed = p.layer === 0 ? 0.3 : p.layer === 1 ? 0.6 : 1.2;
        p.vx += ((noiseX - 0.5) * 2.0) * speed * 0.1;
        p.vy += ((noiseY - 0.5) * 2.0) * speed * 0.1;

        // Mouse interaction — gentle repulsion/attraction ripple
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            // Swirl effect instead of pure push — more organic
            const angle = Math.atan2(dy, dx) + Math.PI * 0.3;
            p.vx += Math.cos(angle) * force * 0.3;
            p.vy += Math.sin(angle) * force * 0.3;
            // Particles near cursor glow slightly
            p.opacity = Math.min(p.baseOpacity + force * 0.4, 0.7);
            p.radius = p.baseRadius + force * 1.5;
            p.isHovered = true;
          } else {
            p.opacity += (p.baseOpacity - p.opacity) * 0.05;
            p.radius += (p.baseRadius - p.radius) * 0.05;
            p.isHovered = false;
          }
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.02;
          p.radius += (p.baseRadius - p.radius) * 0.02;
          p.isHovered = false;
        }

        // Damping — keeps everything smooth
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx;
        p.y += p.vy;

        // Breathing effect on phase
        p.phase += 0.008 * p.phaseSpeed;
        const breath = Math.sin(p.phase) * 0.3 + 0.7;

        // Digital flickering — occasionally swap 0 and 1
        if (Math.random() < 0.02) {
          p.baseChar = Math.random() < 0.5 ? "0" : "1";
        }
        // Randomize the hover char occasionally as well
        if (Math.random() < 0.05) {
          p.hoverChar = Math.random() < 0.5 ? "Z" : "P";
        }

        // Wrap around edges with soft buffer
        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;

        // Draw — vivid data colors with text rendering
        const drawOpacity = p.opacity * breath;

        ctx!.font = `500 ${Math.floor(p.radius * 4) + 4}px 'JetBrains Mono', monospace`;
        ctx!.textAlign = "center";
        ctx!.textBaseline = "middle";

        const displayChar = p.isHovered ? p.hoverChar : p.baseChar;

        if (p.layer === 2) {
          // Fast layer gets streak/glow via text shadow
          ctx!.shadowColor = `rgba(${p.color}, ${drawOpacity})`;
          ctx!.shadowBlur = p.radius * 3;
          ctx!.fillStyle = `rgba(${p.color}, ${drawOpacity})`;
          ctx!.fillText(displayChar, p.x, p.y);

          // Core bright center for glowing effect
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = `rgba(255, 255, 255, ${drawOpacity * 0.9})`;
          ctx!.fillText(displayChar, p.x, p.y);
        } else {
          ctx!.shadowBlur = 0;
          ctx!.fillStyle = `rgba(${p.color}, ${drawOpacity})`;
          ctx!.fillText(displayChar, p.x, p.y);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDark, handleMouseMove, handleMouseLeave]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "auto" }}
    />
  );
}
