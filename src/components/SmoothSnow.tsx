"use client";

import { useEffect, useRef } from "react";

type Mote = {
  x: number;
  y: number;
  depth: number;
  phase: number;
  sway: number;
  fallSpeed: number;
};

// Cache a compact white flake with soft edges once for all particles.
function makeSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 32;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const flake = ctx.createRadialGradient(16, 16, 0, 16, 16, 15);
  flake.addColorStop(0, "rgba(255,255,255,1)");
  flake.addColorStop(0.55, "rgba(245,248,255,.95)");
  flake.addColorStop(0.8, "rgba(235,242,255,.45)");
  flake.addColorStop(1, "rgba(235,242,255,0)");
  ctx.fillStyle = flake;
  ctx.fillRect(0, 0, 32, 32);
  return sprite;
}

export default function SmoothSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !container || !ctx) return;

    const sprite = makeSprite();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let motes: Mote[] = [];
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let visible = false;

    const draw = (dt: number) => {
      elapsed += dt;
      ctx.clearRect(0, 0, width, height);
      // Shared gusts keep the cloud coherent; individual eddies add depth.
      const wind = 25 + Math.sin(elapsed * 0.38) * 34 + Math.sin(elapsed * 0.83) * 12;
      const lift = Math.sin(elapsed * 0.47) * 7;
      const padding = 24;
      for (const mote of motes) {
        const eddy = Math.sin(elapsed * (0.7 + mote.depth * 0.5) + mote.phase);
        mote.x += (wind * (0.45 + mote.depth) + eddy * mote.sway) * dt;
        mote.y += (mote.fallSpeed + lift * mote.depth + eddy * 5) * dt;
        // Wrap only once the entire sprite is outside the viewport, retaining
        // overshoot and phase so gusts never reset a particle's motion.
        if (mote.x > width + padding) mote.x -= width + padding * 2;
        if (mote.x < -padding) mote.x += width + padding * 2;
        if (mote.y > height + padding) mote.y -= height + padding * 2;
        const size = 1.2 + mote.depth * mote.depth * 3.8;
        ctx.globalAlpha = 0.18 + mote.depth * mote.depth * 0.6;
        ctx.drawImage(sprite, mote.x - size / 2, mote.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      draw(dt);
      frame = requestAnimationFrame(tick);
    };

    const syncAnimation = () => {
      cancelAnimationFrame(frame);
      previous = 0;
      if (visible && !document.hidden && !preference.matches) {
        frame = requestAnimationFrame(tick);
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const oldWidth = width;
      const oldHeight = height;
      width = rect.width;
      height = rect.height;
      // Bound both retina rendering cost and the particle count on large screens.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(3000, Math.max(200, Math.round(width * height / 520)));
      // Preserve the existing cloud on resize instead of randomizing every mote.
      for (const mote of motes) {
        mote.x *= width / (oldWidth || width || 1);
        mote.y *= height / (oldHeight || height || 1);
      }
      if (motes.length > count) motes.length = count;
      while (motes.length < count) {
        const depth = Math.random();
        motes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          phase: Math.random() * Math.PI * 2,
          sway: 10 + Math.random() * 20,
          fallSpeed: 20 + depth * 36 + Math.random() * 12,
        });
      }
      draw(0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", syncAnimation);
    preference.addEventListener("change", syncAnimation);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      preference.removeEventListener("change", syncAnimation);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}
