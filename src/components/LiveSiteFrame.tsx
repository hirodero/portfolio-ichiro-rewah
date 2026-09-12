"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { isHeroScrolling, subscribeHeroLive } from "@/lib/hero-focus";

interface LiveSiteFrameProps {
  src?: string;
  fallbackSrc: string;
  title: string;
}

const LIVE_W = 1440;
const LIVE_H = 900;

function isNestedPreview() {
  if (window.self !== window.top) return true;
  return new URLSearchParams(window.location.search).has("preview");
}

export function LiveSiteFrame({ src, fallbackSrc, title }: LiveSiteFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [isArmed, setIsArmed] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !src || isNestedPreview()) return;

    const measure = () => {
      const { width, height } = frame.getBoundingClientRect();
      if (width < 16 || height < 16) {
        setScale(0);
        return;
      }
      const next = Math.min(width / LIVE_W, height / LIVE_H);
      setScale(Number.isFinite(next) && next > 0 ? next : 0);
    };

    const armIfReady = () => {
      if (!visibleRef.current || isHeroScrolling()) return;
      setIsArmed(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        visibleRef.current = visible;
        setIsInView(visible);
        if (!visible) setIsReady(false);
        else armIfReady();
      },
      { rootMargin: "48px 0px", threshold: 0.08 },
    );

    const ro = new ResizeObserver(measure);
    io.observe(frame);
    ro.observe(frame);
    measure();
    const unsub = subscribeHeroLive(armIfReady);

    return () => {
      io.disconnect();
      ro.disconnect();
      unsub();
    };
  }, [src]);

  const canShowFrame = Boolean(src && isArmed && isInView && scale > 0.05);

  return (
    <div
      className={`live-site-frame${isReady ? " is-live" : ""}`}
      ref={frameRef}
      style={{ "--live-scale": String(scale) } as CSSProperties}
    >
      <img src={fallbackSrc} alt="" aria-hidden="true" width={1180} height={720} decoding="async" />
      {canShowFrame ? (
        <div className={`live-site-scaler${isReady ? " is-ready" : ""}`}>
          <iframe
            src={src}
            title={title}
            tabIndex={-1}
            loading="lazy"
            onLoad={() => setIsReady(true)}
          />
        </div>
      ) : null}
    </div>
  );
}
