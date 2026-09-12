"use client";

import { useState } from "react";
import CircularText from "./CircularText";
import FlyingPaimon from "./FlyingPaimon";

export default function HeroBeacons() {
  const [summonNonce, setSummonNonce] = useState(0);

  return (
    <>
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
