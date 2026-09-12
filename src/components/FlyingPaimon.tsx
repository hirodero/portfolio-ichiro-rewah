"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./FlyingPaimon.css";

const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

const RIGHT_SRC = "/images/hero/paimon-right.jpg";
const LEFT_SRC = "/images/hero/paimon-left.jpg";

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

function punchBlack(src: string) {
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(src);
        return;
      }

      context.drawImage(image, 0, 0);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        if (luma < 10) pixels[index + 3] = 0;
        else if (luma < 26) pixels[index + 3] = Math.round(((luma - 10) / 16) * 255);
      }

      context.putImageData(frame, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve(src);
    image.src = src;
  });
}

export default function FlyingPaimon() {
  const flyerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const trailRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [facing, setFacing] = useState<"right" | "left">("right");
  const [rightSrc, setRightSrc] = useState(RIGHT_SRC);
  const [leftSrc, setLeftSrc] = useState(LEFT_SRC);

  useEffect(() => {
    let isActive = true;
    Promise.all([punchBlack(RIGHT_SRC), punchBlack(LEFT_SRC)]).then(([right, left]) => {
      if (!isActive) return;
      setRightSrc(right);
      setLeftSrc(left);
      setAssetsReady(true);
    });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const flyer = flyerRef.current;
    const hero = flyer?.parentElement;
    if (!flyer || !hero || !assetsReady) return;
    const circle = hero.querySelector<HTMLElement>(".hero-circular-text");
    const portal = portalRef.current;
    const hasPortal = Boolean(circle?.offsetWidth);
    const portalCenter = () => ({
      x: circle ? circle.offsetLeft + circle.offsetWidth / 2 : hero.clientWidth * .2,
      y: circle ? circle.offsetTop + circle.offsetHeight / 2 : hero.clientHeight * .25,
      size: circle?.offsetWidth || 120,
    });
    let origin = portalCenter();

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMotionEnabled(!motion.matches);
    let frame = 0;
    let width = hero.clientWidth;
    let height = hero.clientHeight;
    let targetWidth = width;
    let targetHeight = height;
    let size = Math.min(280, Math.max(148, width * 0.2));
    let x = hasPortal ? origin.x - size / 2 : -size - 36;
    let direction = 1;
    let time = 0;
    let last = 0;
    let trailId = 0;
    let visible = false;
    let tail: { x: number; y: number } | null = null;
    let heroTop = hero.getBoundingClientRect().top + window.scrollY;
    let scrollLift = 0;
    let targetScrollLift = 0;
    const updateScrollLift = () => {
      const scrolled = Math.max(0, window.scrollY - heroTop);
      targetScrollLift = -Math.min(scrolled * 0.24, targetHeight * 0.18, 140);
    };
    updateScrollLift();
    // The scroll handler only records a target; the flight loop eases it in.
    window.addEventListener("scroll", updateScrollLift, { passive: true });

    const resize = new ResizeObserver(() => {
      targetWidth = hero.clientWidth;
      targetHeight = hero.clientHeight;
      origin = portalCenter();
      heroTop = hero.getBoundingClientRect().top + window.scrollY;
      updateScrollLift();
    });
    resize.observe(hero);

    const tick = (now: number) => {
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
      const progress = hasPortal ? Math.max(0, Math.min(1, (time - 0.85) / 2.6)) : 1;
      const emerge = progress * progress * progress * (progress * (progress * 6 - 15) + 10);
      scrollLift += (targetScrollLift - scrollLift) * (1 - Math.exp(-delta / 0.24));
      const flightY = padTop + usable * lane + hover + scrollLift;
      const y = (origin.y - spriteHeight / 2) * (1 - emerge) + flightY * emerge;
      const scale = 0.08 + 0.92 * emerge;
      const tilt = Math.sin(time * 0.6) * 1.8 + Math.sin(time * 0.31 + 2.05) * 0.8;
      x += direction * width * 0.032 * delta * emerge;
      if (portal && hasPortal && time < 4.5) {
        const pulse = Math.sin(Math.PI * Math.min(1, time / 4.2));
        portal.style.left = `${origin.x}px`;
        portal.style.top = `${origin.y}px`;
        portal.style.width = `${origin.size * 1.25}px`;
        portal.style.opacity = `${pulse * 0.7}`;
        portal.style.transform = `translate(-50%, -50%) scale(${0.55 + 0.45 * Math.min(1, time / 1.2)}) rotate(${time * 35}deg)`;
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

    function syncAnimation() {
      setMotionEnabled(!motion.matches);
      flyer?.style.setProperty("--paimon-animation-state", visible && !document.hidden && !motion.matches ? "running" : "paused");
      cancelAnimationFrame(frame);
      last = 0;
      if (visible && !document.hidden && !motion.matches) {
        frame = requestAnimationFrame(tick);
      } else {
        trailRef.current = null;
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimation();
    });
    observer.observe(hero);
    document.addEventListener("visibilitychange", syncAnimation);
    motion.addEventListener("change", syncAnimation);
    flyer.style.width = `${size}px`;
    flyer.style.transform = `translate3d(${x}px, ${height * 0.32}px, 0)`;

    return () => {
      cancelAnimationFrame(frame);
      trailRef.current = null;
      resize.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollLift);
      document.removeEventListener("visibilitychange", syncAnimation);
      motion.removeEventListener("change", syncAnimation);
    };
  }, [assetsReady]);

  return (
    <>
      <div className="paimon-portal" ref={portalRef} aria-hidden="true" />
      {motionEnabled && <SplashCursor
        className="paimon-trail-splash"
        targetSelector=".hero-shell"
        followRef={trailRef}
        followPointer={false}
        RAINBOW_MODE={false}
        COLOR="#ffffff"
        DYE_RESOLUTION={512}
        SIM_RESOLUTION={96}
        DENSITY_DISSIPATION={1.8}
        VELOCITY_DISSIPATION={1.6}
        SPLAT_RADIUS={0.035}
        SPLAT_FORCE={1800}
        FOLLOW_STRENGTH={0.18}
        FOLLOW_FLOW={-0.65}
        SHADING={false}
      />}
      <div className="flying-paimon" ref={flyerRef} aria-hidden="true">
        <img src={rightSrc} alt="" className={facing === "right" ? "is-on" : undefined} />
        <img src={leftSrc} alt="" className={facing === "left" ? "is-on" : undefined} />
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
              {Array.from({ length: 18 }, (_, spark) => {
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
    </>
  );
}
