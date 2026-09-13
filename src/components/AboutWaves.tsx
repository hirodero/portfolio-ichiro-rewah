"use client";

import { useEffect, useState } from "react";
import GradientWaves from "./GradientWaves";
import { isHeroFocused, isHeroScrolling, subscribeHeroLive } from "@/lib/hero-focus";

export default function AboutWaves() {
  const [isReady, setIsReady] = useState(false);
  const [heroFocused, setHeroFocused] = useState(true);
  const [compact, setCompact] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    let warmed = false;

    const warm = () => {
      if (warmed) return;
      warmed = true;
      setIsReady(true);
    };

    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(warm, { timeout: 280 });
    } else {
      timeoutId = window.setTimeout(warm, 80);
    }

    const compactQuery = window.matchMedia("(max-width: 700px), (pointer: coarse)");
    const updateCompact = () => setCompact(compactQuery.matches);
    updateCompact();
    compactQuery.addEventListener("change", updateCompact);

    const about = document.getElementById("about");
    const io = about
      ? new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) warm();
        }, { rootMargin: "60% 0px", threshold: 0 })
      : null;
    if (about && io) io.observe(about);

    const unsub = subscribeHeroLive(() => {
      setHeroFocused(isHeroFocused());
      setScrolling(isHeroScrolling());
    });

    return () => {
      compactQuery.removeEventListener("change", updateCompact);
      io?.disconnect();
      unsub();
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="about-waves" aria-hidden="true">
      {isReady ? (
        <GradientWaves
          horizonColor="#5227FF"
          waveColor="#FF9FFC"
          crestColor="#FFFFFF"
          speed={0.4}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={15}
          detail={compact ? "low" : "medium"}
          brightness={0.92}
          opacity={0.88}
          mouseInteraction={!compact}
          parallaxStrength={compact ? 0 : 0.5}
          grain={!compact}
          grainIntensity={0.05}
          maxDpr={compact ? 1 : 2}
          resolutionScale={compact ? 0.52 : 1}
          paused={heroFocused || (compact && scrolling)}
        />
      ) : null}
    </div>
  );
}
