"use client";

import { Fragment, useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  isActive?: boolean;
  className?: string;
}

interface ParsedCount {
  value: number;
  format: (value: number) => string;
}

export function useInViewReplay<T extends Element>(threshold = 0.22) {
  const ref = useRef<T | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isActive };
}

export function useCountUp(target: number, isActive: boolean, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }

    if (!isActive) {
      setValue(0);
      return;
    }

    const started = performance.now();
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, isActive, target]);

  return value;
}

export function parseCountToken(token: string): ParsedCount | null {
  const match = token.match(/^(\d[\d,]*)(\+?)$/);
  if (!match) return null;

  const grouped = match[1].includes(",");
  const digits = match[1].replace(/,/g, "");
  const value = Number(digits);
  if (!Number.isFinite(value)) return null;
  if (!grouped && !match[2] && digits.length === 4 && value >= 1900 && value <= 2100) {
    return null;
  }

  const pad = match[1].startsWith("0") && !grouped ? match[1].length : 0;
  const suffix = match[2];

  return {
    value,
    format(next: number) {
      let body = grouped ? next.toLocaleString("en-US") : String(next);
      if (pad) body = String(next).padStart(pad, "0");
      return `${body}${suffix}`;
    }
  };
}

export function CountUp({
  value,
  format,
  duration = 1100,
  isActive,
  className
}: CountUpProps) {
  const self = useInViewReplay<HTMLSpanElement>();
  const active = isActive ?? self.isActive;
  const current = useCountUp(value, active, duration);
  const label = format ? format(current) : String(current);

  return (
    <span
      ref={isActive === undefined ? self.ref : undefined}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {label}
    </span>
  );
}

export function CountUpPhrase({
  text,
  isActive
}: {
  text: string;
  isActive?: boolean;
}) {
  const parts = text.split(/(\d[\d,]*\+?)/g);

  return (
    <>
      {parts.map((part, index) => {
        const parsed = parseCountToken(part);
        if (!parsed) return <Fragment key={index}>{part}</Fragment>;
        return (
          <CountUp
            key={index}
            value={parsed.value}
            format={parsed.format}
            isActive={isActive}
          />
        );
      })}
    </>
  );
}
