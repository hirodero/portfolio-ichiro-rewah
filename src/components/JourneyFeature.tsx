"use client";

import { useEffect } from "react";
import type { JourneyCommunity } from "@/data/journey";
import { CountUpPhrase, useCountUp, useInViewReplay } from "./CountUp";
import ProofImage from "./ProofImage";

interface JourneyFeatureProps {
  item: JourneyCommunity;
}

function Stat({ value, label, isActive, featured = false }: { value: number; label: string; isActive: boolean; featured?: boolean }) {
  const count = useCountUp(value, isActive);

  return (
    <div className={`journey-stat${featured ? " is-featured" : ""}`}>
      <strong>{count}</strong>
      <span>{label}</span>
    </div>
  );
}

export default function JourneyFeature({ item }: JourneyFeatureProps) {
  const { ref: cardRef, isActive } = useInViewReplay<HTMLElement>(0.22);
  const metrics = item.metrics ?? [];
  const proof = item.proofMedia?.[0];

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const host: HTMLElement = card;

    if (window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) {
      return;
    }

    let targetX = 0.42;
    let targetY = 0.38;
    let currentX = 0.42;
    let currentY = 0.38;
    let frame = 0;

    function onMove(event: PointerEvent) {
      const rect = host.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / Math.max(rect.width, 1);
      targetY = (event.clientY - rect.top) / Math.max(rect.height, 1);
    }

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      host.style.setProperty("--glow-x", currentX.toFixed(4));
      host.style.setProperty("--glow-y", currentY.toFixed(4));
      host.style.setProperty("--proof-x", currentX.toFixed(4));
      host.style.setProperty("--proof-y", currentY.toFixed(4));
      frame = requestAnimationFrame(tick);
    }

    host.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      host.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [cardRef]);

  return (
    <article ref={cardRef} className="journey-card journey-feature reveal">
      <header>
        <p className="journey-kicker">Community</p>
        <h3>{item.title}</h3>
        <p className="journey-meta">
          <span>{item.role}</span>
          <span>{item.period}</span>
        </p>
      </header>
      {proof && (
        <ProofImage
          media={proof}
          variant="hero"
          sizes="(max-width: 700px) 92vw, (max-width: 1100px) 48vw, 38vw"
        />
      )}
      {metrics.length > 0 && (
        <div className="journey-stats">
          {metrics.map((stat) => (
            <Stat key={stat.label} value={stat.value} label={stat.label} isActive={isActive} />
          ))}
        </div>
      )}
      <p><CountUpPhrase text={item.description} isActive={isActive} /></p>
    </article>
  );
}
