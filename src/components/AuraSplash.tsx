"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function AuraSplash() {
  const [enabled, setEnabled] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(preference.matches);
    update();
    preference.addEventListener("change", update);

    const host = document.querySelector(".about-copy");
    const arm = () => setArmed(true);
    host?.addEventListener("pointerenter", arm, { once: true });

    return () => {
      preference.removeEventListener("change", update);
      host?.removeEventListener("pointerenter", arm);
    };
  }, []);

  return enabled && armed ? <SplashCursor
    targetSelector=".about-copy"
    className="aura-splash-cursor"
    DYE_RESOLUTION={512}
    SIM_RESOLUTION={96}
    DENSITY_DISSIPATION={2.5}
    SPLAT_RADIUS={0.3}
    RAINBOW_MODE={false}
    COLOR="#9654ec"
    COLOR_END="#78e65b"
  /> : null;
}
