"use client";

import { useEffect, useState } from "react";
import ParticleText from "./ParticleText";

interface HeroTextProps {
  text: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  className?: string;
  color?: string;
  particleSize?: number;
  density?: number;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  glow?: boolean;
  maxParticles?: number;
  gatherFrom?: "scatter" | "center";
  glyphAlign?: "center" | "top";
  fadeRatio?: number;
  particles?: boolean;
}

export default function HeroText({
  text,
  fontSize = "1em",
  fontWeight = 500,
  className = "",
  color = "#ffffff",
  particleSize = 1.6,
  density = 3,
  scatter = 72,
  gatherDuration = 1100,
  stagger = 220,
  glow = false,
  maxParticles,
  gatherFrom = "scatter",
  glyphAlign = "center",
  fadeRatio = 0.7,
  particles = true,
}: HeroTextProps) {
  const [phase, setPhase] = useState<"gathering" | "fading" | "settled">("gathering");

  useEffect(() => {
    const isLite =
      !particles
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || window.self !== window.top
      || new URLSearchParams(window.location.search).has("preview");
    if (isLite) {
      setPhase("settled");
      return;
    }

    const total = gatherDuration + stagger;
    const fadeAt = Math.max(720, total * fadeRatio);
    const settleAt = fadeAt + 1300;
    const fadeTimer = window.setTimeout(() => setPhase("fading"), fadeAt);
    const settleTimer = window.setTimeout(() => setPhase("settled"), settleAt);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(settleTimer);
    };
  }, [gatherDuration, stagger, fadeRatio]);

  return (
    <span className={`hero-text ${className} is-${phase}`}>
      <span className="hero-text__solid">{text}</span>
      {phase !== "settled" && (
        <ParticleText
          text={text}
          color={color}
          highlightColor={color}
          particleSize={particleSize}
          density={density}
          scatter={scatter}
          gatherDuration={gatherDuration}
          stagger={stagger}
          pointerRepel={0}
          idleDrift={0}
          trigger="mount"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fontFamily="inherit"
          glow={glow}
          maxParticles={maxParticles}
          gatherFrom={gatherFrom}
          glyphAlign={glyphAlign}
        />
      )}
    </span>
  );
}
