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

function PreviewLoader({ active = false, delayed = false, hidden = false }: { active?: boolean; delayed?: boolean; hidden?: boolean }) {
  return (
    <div className={`live-site-loader${active && !delayed ? " is-loading" : ""}`} aria-hidden={hidden}>
      <span className="live-site-loader-ring" aria-hidden="true" />
      <span>{delayed ? "Preview is taking a little longer" : "Loading live preview"}</span>
    </div>
  );
}

// Readiness belongs to this iframe instance, so remounts never expose an empty frame.
function ActivePreview({ src, title }: { src: string; title: string }) {
  const [ready, setReady] = useState(false);
  const [delayed, setDelayed] = useState(false);
  const paintRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(paintRef.current), []);

  useEffect(() => {
    if (ready) return;
    const timeout = window.setTimeout(() => setDelayed(true), 20000);
    return () => window.clearTimeout(timeout);
  }, [ready]);

  const reveal = () => {
    cancelAnimationFrame(paintRef.current);
    // Give the loaded document a paint opportunity before fading out the cover.
    paintRef.current = requestAnimationFrame(() => {
      paintRef.current = requestAnimationFrame(() => setReady(true));
    });
  };

  return (
    <div className={`live-site-preview${ready ? " is-ready" : ""}`} aria-busy={!ready}>
      <div className="live-site-scaler">
        <iframe src={src} title={title} tabIndex={-1} loading="eager" onLoad={reveal} />
      </div>
      <PreviewLoader active delayed={delayed} hidden={ready} />
    </div>
  );
}

export function LiveSiteFrame({ src, fallbackSrc, title }: LiveSiteFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const [isArmed, setIsArmed] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isStatic, setIsStatic] = useState(!src);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    const staticPreview = !src || isNestedPreview();
    setIsStatic(staticPreview);
    if (!frame || staticPreview) return;

    const measure = () => {
      const { width, height } = frame.getBoundingClientRect();
      const next = Math.min(width / LIVE_W, height / LIVE_H);
      setScale(Number.isFinite(next) && next > 0 ? next : 0);
    };

    const armIfReady = () => {
      if (!visibleRef.current || document.hidden) {
        setIsArmed(false);
        return;
      }
      if (!isHeroScrolling()) setIsArmed(true);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        visibleRef.current = visible;
        setIsInView(visible);
        armIfReady();
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

  const canShowFrame = Boolean(src && !isStatic && isArmed && isInView && scale > 0.05);

  return (
    <div
      className="live-site-frame"
      ref={frameRef}
      style={{ "--live-scale": String(scale) } as CSSProperties}
    >
      {isStatic ? (
        <img src={fallbackSrc} alt="" aria-hidden="true" width={1180} height={720} loading="lazy" decoding="async" />
      ) : canShowFrame && src ? (
        <ActivePreview key={src} src={src} title={title} />
      ) : <PreviewLoader active={isInView} />}
    </div>
  );
}
