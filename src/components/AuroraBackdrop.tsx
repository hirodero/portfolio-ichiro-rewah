"use client";

import { useEffect, useRef } from "react";

export default function AuroraBackdrop({ idPrefix, wide = false }: { idPrefix: string; wide?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wide) return;
    const wrap = wrapRef.current;
    const host = wrap?.closest(".about-copy");
    if (!wrap || !(host instanceof HTMLElement)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;

    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;
    let splash = 0;
    let frame = 0;
    let isVisible = true;

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      const nextX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const nextY = (event.clientY - rect.top) / Math.max(rect.height, 1);
      splash = Math.min(1, splash + Math.hypot(nextX - targetX, nextY - targetY) * 7);
      targetX = nextX;
      targetY = nextY;
    };

    const tick = () => {
      if (!isVisible) {
        frame = 0;
        return;
      }
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      splash *= 0.93;
      wrap.style.setProperty("--au-x", currentX.toFixed(4));
      wrap.style.setProperty("--au-y", currentY.toFixed(4));
      wrap.style.setProperty("--au-splash", splash.toFixed(4));
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !frame) frame = requestAnimationFrame(tick);
    });
    io.observe(host);

    host.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      host.removeEventListener("pointermove", onMove);
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [wide]);

  return (
    <div ref={wrapRef} className="portrait-aurora" aria-hidden="true">
      {wide && <span className="aurora-cursor-splash" />}
      <svg viewBox="0 0 500 640" preserveAspectRatio="none" focusable="false">
        <defs>
          {wide && <linearGradient id={`${idPrefix}-color`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="500" y2="0">
            <stop offset="0" stopColor="#78e65b" />
            <stop offset=".28" stopColor="#59c95d" />
            <stop offset=".5" stopColor="#8998a1" />
            <stop offset=".72" stopColor="#9654ec" />
            <stop offset="1" stopColor="#652bea" />
          </linearGradient>}
          <linearGradient id={`${idPrefix}-purple`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#24212d" stopOpacity="0" />
            <stop offset=".35" stopColor="#6d528a" />
            <stop offset=".7" stopColor="#473253" />
            <stop offset="1" stopColor="#16141c" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${idPrefix}-silver`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24222a" stopOpacity="0" />
            <stop offset=".35" stopColor="#85818e" />
            <stop offset=".65" stopColor="#51475e" />
            <stop offset="1" stopColor="#19151f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="aurora-ribbon aurora-purple" stroke={`url(#${idPrefix}-${wide ? "color" : "purple"})`} d={wide ? "M-100 260 C40 40 170 480 300 220 S510 120 620 300" : "M120 -60 C420 100 -80 160 90 345 S460 460 260 700"} />
        <path className="aurora-ribbon aurora-silver" stroke={`url(#${idPrefix}-${wide ? "color" : "silver"})`} d={wide ? "M-100 400 C80 580 180 100 330 340 S500 460 620 230" : "M340 -60 C60 100 530 205 395 365 S90 515 310 700"} />
        <path className="aurora-ribbon aurora-violet" stroke={`url(#${idPrefix}-${wide ? "color" : "purple"})`} d={wide ? "M-100 330 C60 140 160 540 310 380 S490 80 620 390" : "M-70 460 C85 620 120 60 270 115 S365 550 560 300"} />
      </svg>
    </div>
  );
}
