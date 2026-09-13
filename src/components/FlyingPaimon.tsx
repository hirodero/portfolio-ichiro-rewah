"use client";

import { useEffect, useRef, useState, type CSSProperties, type MutableRefObject } from "react";
import { isHeroLive, isHeroScrolling, subscribeHeroLive } from "@/lib/hero-focus";
import "./FlyingPaimon.css";

const RIGHT_SRC = "/images/hero/paimon-right.webp";
const LEFT_SRC = "/images/hero/paimon-left.webp";

// Each pose has different artwork proportions. Coordinates include the vertical
// letterboxing of the left image within the shared 3:2 flight container.
const SCARF_STARS = [
  { right: [42.6, 30.3], left: [55.6, 37.5], size: 7 },
  { right: [40.9, 46.5], left: [61.6, 47.0], size: 6 },
  { right: [45.8, 50.8], left: [56.7, 51.7], size: 6 },
  { right: [30.2, 35.1], left: [68.9, 39.2], size: 10 },
  { right: [10.6, 51.4], left: [88.7, 53.8], size: 10 },
  { right: [35.8, 60.6], left: [65.4, 67.0], size: 8 },
  { right: [54.8, 90.8], left: [50.9, 79.9], size: 8 },
  { right: [91.6, 82.6], left: [17.6, 79.1], size: 11 },
];

// Trig results can differ by a few ULPs between server and browser engines.
// Serialize CSS at millipixel precision so hydration sees identical strings.
function cssValue(value: number, unit: "px" | "s") {
  return `${Math.round(value * 1000) / 1000}${unit}`;
}

export default function FlyingPaimon({
  summonNonce = 0,
  trailRef: trailRefProp
}: {
  summonNonce?: number;
  trailRef?: MutableRefObject<{ x: number; y: number; id: number } | null>;
}) {
  const flyerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const localTrailRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const trailRef = trailRefProp ?? localTrailRef;
  const [facing, setFacing] = useState<"right" | "left">("right");

  useEffect(() => {
    const flyer = flyerRef.current;
    const hero = flyer?.closest(".hero-shell");
    if (!flyer || !hero) return;
    const portal = portalRef.current;
    const portalNode = () => hero.querySelector<HTMLElement>(".hero-circular-text");
    const portalCenter = () => {
      const circle = portalNode();
      return {
        x: circle ? circle.offsetLeft + circle.offsetWidth / 2 : hero.clientWidth * .2,
        y: circle ? circle.offsetTop + circle.offsetHeight / 2 : hero.clientHeight * .25,
        size: circle?.offsetWidth || 120,
      };
    };
    let usePortal = Boolean(portalNode()?.offsetWidth);
    let origin = portalCenter();
    const fastSummon = summonNonce > 0;
    let emergeDelay = fastSummon ? 0.12 : 0.85;
    let emergeDuration = fastSummon ? 1.05 : 2.6;
    let portalWindow = fastSummon ? 2.1 : 4.5;
    let portalOpen = fastSummon ? 0.4 : 1.2;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = hero.clientWidth;
    let height = hero.clientHeight;
    let targetWidth = width;
    let targetHeight = height;
    let size = Math.min(280, Math.max(148, width * 0.2));
    let x = usePortal ? origin.x - size / 2 : width * 0.08;
    let direction = 1;
    let time = 0;
    let last = 0;
    let trailId = 0;
    let visible = false;
    let tail: { x: number; y: number } | null = null;
    const resize = new ResizeObserver(() => {
      targetWidth = hero.clientWidth;
      targetHeight = hero.clientHeight;
      origin = portalCenter();
    });
    resize.observe(hero);

    setFacing("right");

    let lastDraw = 0;
    const tick = (now: number) => {
      const minFrame = isHeroScrolling() ? 48 : 33;
      if (lastDraw && now - lastDraw < minFrame) {
        frame = requestAnimationFrame(tick);
        return;
      }
      lastDraw = now;
      const delta = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      time += delta;
      // Ease layout changes as well as the flight; resizing must not snap her lane.
      const settle = 1 - Math.exp(-delta / 0.35);
      width += (targetWidth - width) * settle;
      height += (targetHeight - height) * settle;
      size += (Math.min(280, Math.max(148, width * 0.2)) - size) * settle;
      const spriteHeight = size * 2 / 3;
      const padTop = Math.min(110, height * 0.12);
      const padBottom = Math.min(90, height * 0.12);
      const usable = Math.max(90, height - padTop - padBottom - spriteHeight);
      const lane = 0.38 + Math.sin(time * 0.21) * 0.14;
      const hover = Math.sin(time * 0.6) * 8 + Math.sin(time * 0.31 + 2.05) * 4;
      // One clock drives the opening portal, emergence, and acceleration.
      // Smootherstep has zero velocity/acceleration at both ends of the reveal.
      const progress = usePortal ? Math.max(0, Math.min(1, (time - emergeDelay) / emergeDuration)) : 1;
      const emerge = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      const flightY = padTop + usable * lane + hover;
      const y = (origin.y - spriteHeight / 2) * (1 - emerge) + flightY * emerge;
      const scale = 0.08 + 0.92 * emerge;
      const tilt = Math.sin(time * 0.6) * 1.8 + Math.sin(time * 0.31 + 2.05) * 0.8;
      x += direction * width * 0.032 * delta * emerge;
      if (portal && usePortal && time < portalWindow) {
        const pulse = Math.sin(Math.PI * Math.min(1, time / (portalWindow * 0.93)));
        portal.style.left = `${origin.x}px`;
        portal.style.top = `${origin.y}px`;
        portal.style.width = `${origin.size * 1.25}px`;
        portal.style.opacity = `${pulse * 0.7}`;
        portal.style.transform = `translate(-50%, -50%) scale(${0.55 + 0.45 * Math.min(1, time / portalOpen)}) rotate(${time * 55}deg)`;
      } else if (portal) {
        portal.style.opacity = "0";
      }

      // Turn only when the entire sprite is outside the hero on either side.
      if ((direction > 0 && x > width + 36) || (direction < 0 && x < -size - 36)) {
        direction *= -1;
        trailId += 1;
        tail = null;
        setFacing(direction > 0 ? "right" : "left");
      }

      // Emit just below her rear hand, rotating with the sprite. The follow
      // delay lets the plume trail smoothly away from this attachment point.
      const angle = tilt * Math.PI / 180;
      const capeX = size * (direction > 0 ? 0.02 : -0.02);
      const capeY = spriteHeight * 0.06;
      const originX = x + size / 2 + capeX * Math.cos(angle) - capeY * Math.sin(angle);
      const originY = y + spriteHeight / 2 + capeX * Math.sin(angle) + capeY * Math.cos(angle);
      if (!tail) tail = { x: originX, y: originY };
      const follow = 1 - Math.exp(-delta / 0.18);
      tail.x += (originX - tail.x) * follow;
      tail.y += (originY - tail.y) * follow;
      trailRef.current = emerge > 0.85 ? { x: tail.x, y: tail.y, id: trailId } : null;

      flyer.style.width = `${size}px`;
      flyer.style.opacity = `${Math.min(1, emerge * 2.5)}`;
      flyer.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${tilt * emerge}deg) scale(${scale})`;
      frame = requestAnimationFrame(tick);
    };

    let wasLive = false;
    function syncAnimation() {
      const live = visible && isHeroLive() && !motion.matches;
      flyer?.style.setProperty("--paimon-animation-state", live ? "running" : "paused");
      if (live === wasLive) return;
      wasLive = live;
      cancelAnimationFrame(frame);
      last = 0;
      if (live) {
        frame = requestAnimationFrame(tick);
      } else {
        trailRef.current = null;
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    }, { rootMargin: "30% 0px", threshold: [0, 0.01, 0.12] });
    observer.observe(hero);
    const unsubLive = subscribeHeroLive(syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);
    motion.addEventListener("change", syncAnimation);
    const heroBox = hero.getBoundingClientRect();
    visible = heroBox.bottom > 0 && heroBox.top < window.innerHeight;
    flyer.style.width = `${size}px`;
    flyer.style.opacity = "0";
    flyer.style.transform = `translate3d(${x}px, ${origin.y - size / 3}px, 0) scale(0.08)`;
    syncAnimation();

    return () => {
      cancelAnimationFrame(frame);
      trailRef.current = null;
      resize.disconnect();
      observer.disconnect();
      unsubLive();
      document.removeEventListener("visibilitychange", syncAnimation);
      motion.removeEventListener("change", syncAnimation);
    };
  }, [summonNonce]);

  return (
    <div className="paimon-wind" aria-hidden="true">
      <div className="paimon-portal" ref={portalRef} />
      <div className="flying-paimon" ref={flyerRef}>
        <img src={RIGHT_SRC} alt="" className={facing === "right" ? "is-on" : ""} />
        <img src={LEFT_SRC} alt="" className={facing === "left" ? "is-on" : ""} />
        <span className="paimon-scarf-sparkles">
          {SCARF_STARS.map((star, index) => (
            <span className="paimon-star" key={index} style={{
              left: `${star[facing][0]}%`,
              top: `${star[facing][1]}%`,
              "--star-size": cssValue(star.size * 1.35, "px"),
              "--star-duration": cssValue(2.1 + index * 0.17, "s"),
              "--star-delay": cssValue(-index * 0.73, "s"),
              "--spark-x": `${(facing === "right" ? -1 : 1) * (12 + index % 3 * 5)}px`,
              "--spark-y": `${-9 - index % 4 * 4}px`,
            } as CSSProperties}>
              <i className="paimon-star-flare" />
              <i className="paimon-star-rays" />
              <i className="paimon-star-rays paimon-star-rays-diagonal" />
              {Array.from({ length: 3 }, (_, spark) => {
                const angle = spark * Math.PI * 2 / 18 + index * 0.4;
                const distance = 18 + spark % 6 * 7;
                return <i className="paimon-star-spark" key={spark} style={{
                  "--spark-x": cssValue(Math.cos(angle) * distance, "px"),
                  "--spark-y": cssValue(Math.sin(angle) * distance, "px"),
                  animationDelay: cssValue(-index * 0.73 - spark * 0.19, "s"),
                  animationDuration: cssValue(1.8 + spark % 5 * 0.22, "s"),
                } as CSSProperties} />;
              })}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
