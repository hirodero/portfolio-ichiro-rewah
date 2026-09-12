"use client";

import { useEffect } from "react";

interface Spring {
  p: number;
  v: number;
}

function stepSpring(spring: Spring, target: number, dt: number, stiffness: number, damping: number) {
  const accel = (target - spring.p) * stiffness - spring.v * damping;
  spring.v += accel * dt;
  spring.p += spring.v * dt;
}

function settled(spring: Spring, target: number) {
  return Math.abs(target - spring.p) < 0.08 && Math.abs(spring.v) < 0.12;
}

export default function HeroWind() {
  useEffect(() => {
    const hero = document.querySelector(".hero-shell");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!(hero instanceof HTMLElement) || motion.matches) return undefined;

    let snowEl = hero.querySelector(".snow-background");
    let paimonEl = hero.querySelector(".paimon-wind");

    const snowY: Spring = { p: 0, v: 0 };
    const snowX: Spring = { p: 0, v: 0 };
    const paimonY: Spring = { p: 0, v: 0 };
    const paimonX: Spring = { p: 0, v: 0 };
    const paimonRot: Spring = { p: 0, v: 0 };

    let progress = 0;
    let lastRaw = 0;
    let velocity = 0;
    let lastTime = 0;
    let lastInput = 0;
    let raf = 0;
    let travel = Math.max(hero.offsetHeight * 0.68, 1);

    const readProgress = () => {
      return Math.min(1, Math.max(0, window.scrollY / travel));
    };

    const apply = () => {
      if (!(snowEl instanceof HTMLElement)) snowEl = hero.querySelector(".snow-background");
      if (!(paimonEl instanceof HTMLElement)) paimonEl = hero.querySelector(".paimon-wind");
      if (snowEl instanceof HTMLElement) {
        snowEl.style.transform = `translate3d(${snowX.p.toFixed(2)}px, ${snowY.p.toFixed(2)}px, 0)`;
      }
      if (paimonEl instanceof HTMLElement) {
        paimonEl.style.transform = `translate3d(${paimonX.p.toFixed(2)}px, ${paimonY.p.toFixed(2)}px, 0) rotate(${paimonRot.p.toFixed(3)}deg)`;
      }
    };

    const tick = (now: number) => {
      const dt = lastTime ? Math.min(0.032, (now - lastTime) / 1000) : 0.016;
      lastTime = now;

      const compact = window.innerWidth <= 700;
      const raw = readProgress();
      const instantVel = dt > 0 ? (raw - lastRaw) / dt : 0;
      lastRaw = raw;
      velocity += (instantVel - velocity) * (1 - Math.exp(-dt / 0.07));
      progress += (raw - progress) * (1 - Math.exp(-dt / 0.08));

      const dipWave = Math.sin(Math.min(progress / 0.18, 1) * Math.PI);
      const lift = Math.pow(Math.max(0, progress - 0.09), 1.38);
      const gust = Math.min(Math.max(0, velocity) * (compact ? 38 : 58), compact ? 56 : 100);
      const snowDip = dipWave * (compact ? 56 : 92) + gust * 0.55;
      const paimonDip = dipWave * (compact ? 170 : 286) + gust * 1.55;
      const snowRise = lift * (compact ? 180 : 300);
      const paimonRise = lift * (compact ? 230 : 380);
      const sway = Math.sin(progress * Math.PI) * (compact ? 16 : 28);

      const targetSnowY = snowDip - snowRise;
      const targetSnowX = sway * 0.75;
      const targetPaimonY = paimonDip - paimonRise;
      const targetPaimonX = sway;
      const targetPaimonRot = progress * -9 - Math.min(Math.max(velocity, 0), 1.8) * 2.6;

      stepSpring(snowY, targetSnowY, dt, 15, 5.8);
      stepSpring(snowX, targetSnowX, dt, 13, 5.6);
      stepSpring(paimonY, targetPaimonY, dt, 14, 4.2);
      stepSpring(paimonX, targetPaimonX, dt, 12, 4.5);
      stepSpring(paimonRot, targetPaimonRot, dt, 11, 4.4);
      apply();

      const idle =
        now - lastInput > 480
        && settled(snowY, targetSnowY)
        && settled(snowX, targetSnowX)
        && settled(paimonY, targetPaimonY)
        && settled(paimonX, targetPaimonX)
        && settled(paimonRot, targetPaimonRot);
      raf = idle ? 0 : requestAnimationFrame(tick);
    };

    const kick = () => {
      lastInput = performance.now();
      if (!raf) {
        lastTime = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      travel = Math.max(hero.offsetHeight * 0.68, 1);
    };
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    lastRaw = readProgress();
    progress = lastRaw;
    apply();

    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      if (snowEl instanceof HTMLElement) snowEl.style.transform = "";
      if (paimonEl instanceof HTMLElement) paimonEl.style.transform = "";
    };
  }, []);

  return null;
}
