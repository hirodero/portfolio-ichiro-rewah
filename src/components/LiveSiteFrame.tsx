"use client";

import { useEffect, useRef, useState } from "react";

interface LiveSiteFrameProps {
  src?: string;
  fallbackSrc: string;
  title: string;
}

function isNestedPreview() {
  if (window.self !== window.top) return true;
  return new URLSearchParams(window.location.search).has("preview");
}

export function LiveSiteFrame({ src, fallbackSrc, title }: LiveSiteFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [frameSrc, setFrameSrc] = useState(src);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || isNestedPreview()) return;

    if (!src) setFrameSrc(`${window.location.origin}/?preview=1`);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { rootMargin: "160px" },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={`live-site-frame${isReady ? " is-live" : ""}`} ref={frameRef}>
      <img src={fallbackSrc} alt="" aria-hidden="true" width={1180} height={720} />
      {isInView && frameSrc ? (
        <div className={`live-site-scaler${isReady ? " is-ready" : ""}`}>
          <iframe
            src={frameSrc}
            title={title}
            tabIndex={-1}
            onLoad={() => setIsReady(true)}
          />
        </div>
      ) : null}
    </div>
  );
}
