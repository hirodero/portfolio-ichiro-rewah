"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { setHeroFocused } from "@/lib/hero-focus";

const PixelSnow = dynamic(() => import("./PixelSnow"), { ssr: false });
const LightRays = dynamic(() => import("./LightRays"), { ssr: false });

const DESKTOP_SNOW = {
  pixelResolution: 340,
  density: 0.68,
  farPlane: 24,
  flakeSize: 0.008,
  minFlakeSize: 1.25,
  depthFade: 10,
  brightness: 1.15
};

const MOBILE_SNOW = {
  pixelResolution: 120,
  density: 0.4,
  farPlane: 16,
  flakeSize: 0.01,
  minFlakeSize: 1.45,
  depthFade: 8,
  brightness: 1.22
};

export default function SnowBackground() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [raysEnabled, setRaysEnabled] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia("(max-width: 700px), (pointer: coarse)");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    const available = Boolean(context);
    setSupported(available);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    setCompact(compactQuery.matches);
    setEnabled(available && !preference.matches);
    setRaysEnabled(available && !preference.matches);
    const updateMotion = () => {
      setEnabled(available && !preference.matches);
      setRaysEnabled(available && !preference.matches);
    };
    const updateCompact = () => setCompact(compactQuery.matches);
    preference.addEventListener("change", updateMotion);
    compactQuery.addEventListener("change", updateCompact);

    const hero = document.querySelector(".hero-shell");
    const io = hero
      ? new IntersectionObserver(([entry]) => {
          setHeroFocused(entry.isIntersecting && entry.intersectionRatio >= 0.32);
        }, { threshold: [0, 0.32, 0.55, 0.8] })
      : null;
    if (hero && io) io.observe(hero);

    return () => {
      preference.removeEventListener("change", updateMotion);
      compactQuery.removeEventListener("change", updateCompact);
      io?.disconnect();
    };
  }, []);

  const snow = compact ? MOBILE_SNOW : DESKTOP_SNOW;

  return <>
    <div className={`rays-background${raysEnabled ? " is-on" : ""}`} aria-hidden="true">
      {raysEnabled && <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={!compact}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />}
    </div>
    <div className={`snow-background${enabled ? " is-on" : ""}`} aria-hidden="true">
      {enabled && <PixelSnow
        color="#ffffff"
        flakeSize={snow.flakeSize}
        minFlakeSize={snow.minFlakeSize}
        pixelResolution={snow.pixelResolution}
        speed={1.25}
        density={snow.density}
        farPlane={snow.farPlane}
        depthFade={snow.depthFade}
        direction={125}
        brightness={snow.brightness}
      />}
    </div>
    {supported && <button className="snow-toggle" type="button" aria-pressed={enabled} onClick={() => setEnabled(value => !value)}>
      <span className="snow-symbol" aria-hidden="true">❄</span> Snow {enabled ? "on" : "off"}
      <span className={`switch ${enabled ? "is-on" : ""}`} aria-hidden="true"><span /></span>
    </button>}
  </>;
}
