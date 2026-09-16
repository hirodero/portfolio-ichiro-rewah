"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./SectionWind.css";

interface Spring {
  p: number;
  v: number;
}

interface Piece {
  el: HTMLElement;
  delay: number;
  xLane: number;
  kicked: boolean;
  keepTransform: boolean;
  x: Spring;
  y: Spring;
}

interface SectionWindProps {
  children?: ReactNode;
  variant?: "about" | "hero";
}

const X_LANES = [-0.42, 0.88, -0.94, 0.36, -0.7, 0.58, -0.32, 0.96];

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function stepSpring(spring: Spring, target: number, dt: number, stiffness: number, damping: number) {
  spring.v += ((target - spring.p) * stiffness - spring.v * damping) * dt;
  spring.p += spring.v * dt;
  if (Math.abs(spring.p - target) < 0.08 && Math.abs(spring.v) < 0.12) {
    spring.p = target;
    spring.v = 0;
    return false;
  }
  return true;
}

function rocket(local: number, xAmp: number, dipAmp: number, liftAmp: number) {
  if (local <= 0) return { x: 0, y: 0 };

  const dipEnd = 0.28;
  if (local <= dipEnd) {
    const t = 1 - (1 - local / dipEnd) ** 4;
    return { x: xAmp * t, y: dipAmp * t };
  }

  const t = ((local - dipEnd) / (1 - dipEnd)) ** 1.12;
  return {
    x: xAmp * (0.78 + 0.32 * t),
    y: dipAmp * (1 - t) - liftAmp * t
  };
}

function swing(local: number, xAmp: number, dipAmp: number, liftAmp: number) {
  if (local <= 0) return { x: 0, y: 0 };

  const eased = local * local * (3 - 2 * local);
  const dip = Math.sin(Math.min(eased / 0.24, 1) * Math.PI);
  const lift = Math.pow(Math.max(0, eased - 0.1), 1.38);
  return {
    x: xAmp * eased,
    y: dipAmp * dip - liftAmp * lift
  };
}

function pick(host: HTMLElement, selector: string) {
  return Array.from(host.querySelectorAll<HTMLElement>(selector));
}

const ABOUT_GROUPS = [
  { selector: ".about-kicker", delay: 0 },
  { selector: ".about-profile-card", delay: 0.04 },
  { selector: ".profile-drift", delay: 0.08 },
  { selector: ".about-copy > h2", delay: 0.05 },
  { selector: ".about-copy > p", delay: 0.09 },
  { selector: ".about-details > span", delay: 0.13 },
  { selector: ".about-toolkit-label", delay: 0.1 },
  { selector: ".icon-motion-item", delay: 0.06 },
  { selector: ".about-toolkit-capabilities", delay: 0.14 }
];

const ABOUT_GROUPS_MOBILE = [
  { selector: ".about-kicker", delay: 0 },
  { selector: ".about-profile-card", delay: 0.05 },
  { selector: ".about-copy > h2", delay: 0.06 },
  { selector: ".about-copy > p", delay: 0.1 },
  { selector: ".about-details", delay: 0.14 },
  { selector: ".about-toolkit-label", delay: 0.1 },
  { selector: ".about-toolkit-icons", delay: 0.12 },
  { selector: ".about-toolkit-capabilities", delay: 0.16 }
];

const HERO_GROUPS = [
  { selector: ".intro-pill", delay: 0 },
  { selector: ".hero-content > .eyebrow", delay: 0.03 },
  { selector: ".hero-title-line", delay: 0.05 },
  { selector: ".hero-desc-line", delay: 0.09 },
  { selector: ".hero-actions .button", delay: 0.12 },
  { selector: ".stack > *", delay: 0.16 },
  { selector: ".scroll-cue", delay: 0.14 },
  { selector: ".hero-note", delay: 0.18 },
  { selector: ".snow-toggle", delay: 0.2 },
  { selector: ".hero-circular-text", delay: 0.07 },
  { selector: ".hero-gallery", delay: 0.11 }
];

export default function SectionWind({ children, variant = "about" }: SectionWindProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = variant === "hero"
      ? document.querySelector(".hero-shell")
      : hostRef.current?.closest(".about-section");
    if (!(host instanceof HTMLElement)) return undefined;
    if (window.self !== window.top || new URLSearchParams(window.location.search).has("preview")) return undefined;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = () => window.innerWidth <= 700;
    const amps = () => {
      const small = compact();
      return {
        x: small ? 22 : 62,
        dip: small ? 36 : 108,
        lift: small ? 96 : 236
      };
    };

    const groups = variant === "about" && compact()
      ? ABOUT_GROUPS_MOBILE
      : variant === "hero" ? HERO_GROUPS : ABOUT_GROUPS;
    const pieces: Piece[] = [];
    const seen = new Set<HTMLElement>();
    let lane = 0;

    const collect = () => {
      for (const group of groups) {
        pick(host, group.selector).forEach((el, index) => {
          if (seen.has(el)) return;
          seen.add(el);
          pieces.push({
            el,
            delay: group.delay + index * 0.04,
            xLane: X_LANES[lane++ % X_LANES.length],
            kicked: false,
            keepTransform: el.classList.contains("hero-note") || el.classList.contains("hero-circular-text"),
            x: { p: 0, v: 0 },
            y: { p: 0, v: 0 }
          });
        });
      }
    };

    collect();

    let lastY = window.scrollY;
    let goingDown = true;
    let downLock = 0;
    let shownFly = 0;

    const noteDirection = () => {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY;
      lastY = y;
      const now = performance.now();
      const jitter = compact() ? 12 : 4;
      if (dy > jitter) {
        goingDown = true;
        downLock = now + 90;
      } else if (dy < -jitter && now > downLock) {
        goingDown = false;
      }
    };

    const readScroll = () => {
      noteDirection();
      const fold = window.innerHeight;
      const small = compact();

      if (variant === "hero") {
        const y = Math.max(0, window.scrollY);
        const startAt = small ? 40 : 20;
        if (y <= startAt || !goingDown) return { fly: 0, returning: true };
        const peakAt = fold * (small ? 0.44 : 0.32);
        return { fly: clamp((y - startAt) / peakAt), returning: false };
      }

      const box = host.getBoundingClientRect();
      const startAt = small ? 56 : 32;
      const origin = fold + startAt;
      if (box.bottom > origin || !goingDown) return { fly: 0, returning: true };
      const peakAt = fold * (small ? 0.52 : 0.4);
      return { fly: clamp((origin - box.bottom) / peakAt), returning: false };
    };

    const styleOf = (piece: Piece) => {
      if (Math.abs(piece.x.p) < 0.08 && Math.abs(piece.y.p) < 0.08) return "";
      return `${piece.x.p.toFixed(2)}px ${piece.y.p.toFixed(2)}px`;
    };

    const apply = (piece: Piece, next: string) => {
      piece.el.style.translate = next;
      if (!piece.keepTransform) piece.el.style.transform = "";
      if (next) {
        if (piece.el.style.willChange !== "translate") piece.el.style.willChange = "translate";
      } else if (piece.el.style.willChange) {
        piece.el.style.willChange = "";
      }
    };

    const clear = (piece: Piece) => {
      piece.x.p = 0;
      piece.x.v = 0;
      piece.y.p = 0;
      piece.y.v = 0;
      piece.kicked = false;
      apply(piece, "");
      piece.el.style.zIndex = "";
    };

    let raf = 0;
    let last = 0;
    let prevFly = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min(0.032, (now - last) / 1000) : 0.016;
      last = now;
      const raw = motion.matches ? { fly: 0, returning: false } : readScroll();
      if (variant === "about") {
        const tau = raw.returning ? 0.045 : 0.12;
        shownFly += (raw.fly - shownFly) * (1 - Math.exp(-dt / tau));
        if (shownFly < 0.002) shownFly = 0;
      } else {
        shownFly = raw.fly;
      }
      const scroll = { fly: shownFly, returning: raw.returning };
      const size = amps();
      const mobile = compact();
      let busy = false;

      for (const piece of pieces) {
        const local = scroll.fly === 0 ? 0 : clamp((scroll.fly - piece.delay) / 0.64);
        const atRest = local === 0 && piece.x.p === 0 && piece.y.p === 0;

        if (atRest && !scroll.returning) {
          if (piece.el.style.translate) clear(piece);
          continue;
        }

        if (scroll.returning && piece.kicked) {
          piece.x.v *= 0.22;
          piece.y.v *= 0.22;
          piece.kicked = false;
        } else if (variant === "hero" && !mobile && !piece.kicked && local > 0.02 && scroll.fly > prevFly) {
          piece.y.v += size.dip * 5.2;
          piece.x.v += piece.xLane * size.x * 1.8;
          piece.kicked = true;
        }

        const target = scroll.returning || local === 0
          ? { x: 0, y: 0 }
          : variant === "hero"
            ? rocket(local, piece.xLane * size.x, size.dip, size.lift)
            : swing(local, piece.xLane * size.x, size.dip, size.lift);

        const stiffness = scroll.returning ? (mobile ? 18 : 20) : (mobile ? 7.4 : variant === "about" ? 8.4 : 10.2);
        const damping = scroll.returning ? (mobile ? 9.2 : 8.4) : (mobile ? 5.2 : variant === "about" ? 4.4 : 3.5);
        const yStiff = scroll.returning ? (mobile ? 19 : 22) : (mobile ? 8.2 : variant === "about" ? 9.2 : 11);
        const movingX = stepSpring(piece.x, target.x, dt, stiffness, damping);
        const movingY = stepSpring(piece.y, target.y, dt, yStiff, damping);
        apply(piece, styleOf(piece));
        busy ||= movingX || movingY || scroll.fly > 0;
      }

      prevFly = scroll.fly;
      raf = busy ? requestAnimationFrame(tick) : 0;
      if (!busy) {
        last = 0;
        shownFly = 0;
      }
    };

    const kick = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(tick);
    };

    const observer = new MutationObserver(() => {
      const before = pieces.length;
      collect();
      if (pieces.length !== before) kick();
    });
    observer.observe(host, { childList: true, subtree: true });

    if (variant !== "hero") kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    document.addEventListener("visibilitychange", kick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      document.removeEventListener("visibilitychange", kick);
      for (const piece of pieces) clear(piece);
    };
  }, [variant]);

  if (variant === "hero") return null;
  return <div ref={hostRef} className="about-motion">{children}</div>;
}
