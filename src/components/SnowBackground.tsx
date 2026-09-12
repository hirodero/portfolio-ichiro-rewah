"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const PixelSnow = dynamic(() => import("./PixelSnow"), { ssr: false });
const LightRays = dynamic(() => import("./LightRays"), { ssr: false });
const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function SnowBackground() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [raysEnabled, setRaysEnabled] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2");
    const available = Boolean(context);
    setSupported(available);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    setEnabled(available && !preference.matches);
    setRaysEnabled(available && !preference.matches);
    const update = () => {
      setEnabled(available && !preference.matches);
      setRaysEnabled(available && !preference.matches);
    };
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return <>
    <div className="rays-background" aria-hidden="true">
      {raysEnabled && <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.5}
        lightSpread={0.8}
        rayLength={1.2}
        followMouse={true}
        mouseInfluence={0.1}
        noiseAmount={0.1}
        distortion={0.05}
        className="custom-rays"
      />}
    </div>
    <div className="snow-background" aria-hidden="true">
      {enabled && <PixelSnow
        color="#ffffff"
        flakeSize={0.008}
        minFlakeSize={1.25}
        pixelResolution={600}
        speed={1.25}
        density={1}
        farPlane={28}
        depthFade={10}
        direction={125}
        brightness={1.15}
      />}
    </div>
    {raysEnabled && <SplashCursor DYE_RESOLUTION={768} />}
    {supported && <button className="snow-toggle" type="button" aria-pressed={enabled} onClick={() => setEnabled(value => !value)}>
      <span className="snow-symbol" aria-hidden="true">❄</span> Snow {enabled ? "on" : "off"}
      <span className={`switch ${enabled ? "is-on" : ""}`} aria-hidden="true"><span /></span>
    </button>}
  </>;
}
