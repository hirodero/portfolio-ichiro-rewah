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
    let goingDown = true;
    let travel = Math.max(hero.offsetHeight * 0.68, 1);

    const readProgress = () => {
      const startAt = window.innerWidth <= 700 ? 40 : 12;
      return Math.min(1, Math.max(0, (window.scrollY - startAt) / travel));
    };

    const apply = (moveSnow: boolean) => {
      if (!(snowEl instanceof HTMLElement)) snowEl = hero.querySelector(".snow-background");
      if (!(paimonEl instanceof HTMLElement)) paimonEl = hero.querySelector(".paimon-wind");
      if (snowEl instanceof HTMLElement) {
        snowEl.style.transform = moveSnow
          ? `translate3d(${snowX.p.toFixed(2)}px, ${snowY.p.toFixed(2)}px, 0)`
          : "";
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
      if (raw > lastRaw + 0.002) goingDown = true;
      else if (raw < lastRaw - 0.002) goingDown = false;
      lastRaw = raw;
      velocity += (instantVel - velocity) * (1 - Math.exp(-dt / 0.07));

      const catchup = !goingDown || Math.abs(raw - progress) > 0.22 ? 0.028 : 0.08;
      progress += (raw - progress) * (1 - Math.exp(-dt / catchup));

      const lift = Math.pow(Math.max(0, progress - 0.09), 1.38);
      const snowRise = lift * (compact ? 180 : 300);
      const paimonRise = lift * (compact ? 140 : 380);
      const sway = Math.sin(progress * Math.PI) * (compact ? 8 : 28);

      let targetSnowY = -snowRise;
      let targetSnowX = sway * (goingDown ? 0.75 : 0.4);
      let targetPaimonY = -paimonRise;
      let targetPaimonX = sway * (goingDown ? 1 : 0.45);
      let targetPaimonRot = progress * (compact ? -4 : -9);

      if (goingDown && !compact) {
        const dipWave = Math.sin(Math.min(progress / 0.18, 1) * Math.PI);
        const gust = Math.min(Math.max(0, velocity) * 58, 100);
        targetSnowY += dipWave * 92 + gust * 0.55;
        targetPaimonY += dipWave * 286 + gust * 1.55;
        targetPaimonRot -= Math.min(Math.max(velocity, 0), 1.8) * 2.6;
      }

      const stiffness = goingDown ? 15 : 26;
      const damping = goingDown ? 5.8 : 11.4;
      if (!compact) {
        stepSpring(snowY, targetSnowY, dt, stiffness, damping);
        stepSpring(snowX, targetSnowX, dt, goingDown ? 13 : 24, damping);
      }
      stepSpring(paimonY, targetPaimonY, dt, goingDown ? 14 : 26, goingDown ? 4.2 : 11);
      stepSpring(paimonX, targetPaimonX, dt, goingDown ? 12 : 22, goingDown ? 4.5 : 10.6);
      stepSpring(paimonRot, targetPaimonRot, dt, goingDown ? 11 : 22, goingDown ? 4.4 : 10.8);
      apply(!compact);

      const idle =
        now - lastInput > 360
        && (compact || (settled(snowY, targetSnowY) && settled(snowX, targetSnowX)))
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
    apply(window.innerWidth > 700);

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
