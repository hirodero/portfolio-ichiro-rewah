"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { skipGpuFx } from "@/lib/device";
import { setHeroFocused, setHeroGpuLite } from "@/lib/hero-focus";

const PixelSnow = dynamic(() => import("./PixelSnow"), { ssr: false });
const LightRays = dynamic(() => import("./LightRays"), { ssr: false });

const DESKTOP_SNOW = {
  pixelResolution: 240,
  density: 0.24,
  farPlane: 10,
  flakeSize: 0.012,
  minFlakeSize: 1.7,
  depthFade: 6.2,
  brightness: 1.2,
  maxSteps: 48,
  minBlock: 3
};

const MOBILE_SNOW = {
  pixelResolution: 140,
  density: 0.16,
  farPlane: 8,
  flakeSize: 0.014,
  minFlakeSize: 1.8,
  depthFade: 5.2,
  brightness: 1.22,
  maxSteps: 36,
  minBlock: 4
};

const LITE_SNOW = {
  pixelResolution: 110,
  density: 0.14,
  farPlane: 7,
  flakeSize: 0.015,
  minFlakeSize: 1.9,
  depthFade: 5,
  brightness: 1.24,
  maxSteps: 28,
  minBlock: 5
};

function detectLiteGpu() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 900px)").matches;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4 && (coarse || narrow)) return true;
  return coarse && narrow;
}

export default function SnowBackground() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [raysEnabled, setRaysEnabled] = useState(false);
  const [compact, setCompact] = useState(false);
  const [lite, setLite] = useState(false);
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactQuery = window.matchMedia("(max-width: 700px), (pointer: coarse)");
    const liteGpu = detectLiteGpu() || skipGpuFx();
    let available = false;
    if (!skipGpuFx()) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl") || canvas.getContext("webgl2");
      available = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    }
    setSupported(!preference.matches);
    setCompact(compactQuery.matches);
    setLite(liteGpu);
    setHeroGpuLite(liteGpu);
    setEnabled(available && !preference.matches);
    setRaysEnabled(available && !preference.matches && !liteGpu);
    const updateMotion = () => {
      setEnabled(available && !preference.matches);
      setRaysEnabled(available && !preference.matches && !liteGpu);
    };
    const updateCompact = () => setCompact(compactQuery.matches);
    const introTimer = window.setTimeout(() => setIntro(false), 1400);
    preference.addEventListener("change", updateMotion);
    compactQuery.addEventListener("change", updateCompact);

    const hero = document.querySelector(".hero-shell");
    const io = hero
      ? new IntersectionObserver(([entry]) => {
          setHeroFocused(entry.isIntersecting && entry.intersectionRatio >= 0.08);
        }, { rootMargin: "28% 0px 8% 0px", threshold: [0, 0.08, 0.2, 0.4] })
      : null;
    if (hero && io) io.observe(hero);

    return () => {
      window.clearTimeout(introTimer);
      preference.removeEventListener("change", updateMotion);
      compactQuery.removeEventListener("change", updateCompact);
      io?.disconnect();
    };
  }, []);

  const snow = lite ? LITE_SNOW : compact ? MOBILE_SNOW : DESKTOP_SNOW;

  return <>
    <div className={`rays-background${raysEnabled ? " is-on" : ""}${intro && raysEnabled ? " is-intro" : ""}`} aria-hidden="true">
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
    <div className={`snow-background${enabled ? " is-on" : ""}${intro && enabled ? " is-intro" : ""}`} aria-hidden="true">
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
        maxSteps={snow.maxSteps}
        minBlock={snow.minBlock}
      />}
    </div>
    {supported && <button className="snow-toggle" type="button" aria-pressed={enabled} onClick={() => setEnabled(value => !value)}>
      <span className="snow-symbol" aria-hidden="true">❄</span> Snow {enabled ? "on" : "off"}
      <span className={`switch ${enabled ? "is-on" : ""}`} aria-hidden="true"><span /></span>
    </button>}
  </>;
}
