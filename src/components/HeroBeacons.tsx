"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CircularText from "./CircularText";
import FlyingPaimon from "./FlyingPaimon";
import HeroWind from "./HeroWind";

const SplashCursor = dynamic(() => import("./SplashCursor"), { ssr: false });

export default function HeroBeacons() {
  const [summonNonce, setSummonNonce] = useState(0);
  const [splashOn, setSplashOn] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return undefined;

    const hero = document.querySelector(".hero-shell");
    const arm = () => {
      if (motion.matches) return;
      setSplashOn(true);
    };
    hero?.addEventListener("pointerdown", arm, { once: true, passive: true });
    hero?.addEventListener("pointermove", arm, { once: true, passive: true });
    const onMotion = () => {
      if (motion.matches) setSplashOn(false);
    };
    motion.addEventListener("change", onMotion);

    return () => {
      hero?.removeEventListener("pointerdown", arm);
      hero?.removeEventListener("pointermove", arm);
      motion.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <>
      {splashOn ? (
        <SplashCursor
          targetSelector=".hero-shell"
          followPointer
          DYE_RESOLUTION={256}
          SIM_RESOLUTION={64}
          CAPTURE_RESOLUTION={192}
          PRESSURE_ITERATIONS={8}
          SHADING={false}
        />
      ) : null}
      <HeroWind />
      <FlyingPaimon summonNonce={summonNonce} />
      <CircularText
        className="hero-circular-text"
        text="PORTFOLIO • PORTFOLIO • "
        hoverText="CALL PAIMON • CALL PAIMON • "
        spinDuration={22}
        onHover="speedUp"
        onActivate={() => setSummonNonce((count) => count + 1)}
      />
    </>
  );
}
