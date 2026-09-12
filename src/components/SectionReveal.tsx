"use client";

import { useLayoutEffect, useRef, useState, type ElementType, type HTMLAttributes } from "react";
import "./SectionReveal.css";

interface SectionRevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  startInView?: boolean;
  latch?: boolean;
  settleMs?: number;
}

export default function SectionReveal({
  as: Tag = "section",
  className,
  startInView = false,
  latch = false,
  settleMs = 0,
  children,
  ...props
}: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInView, setIsInView] = useState(startInView);
  const [isSettled, setIsSettled] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsReady(true);
      setIsInView(true);
      setIsSettled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          return;
        }
        if (!latch) setIsInView(false);
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    setIsReady(true);
    return () => observer.disconnect();
  }, [latch]);

  useLayoutEffect(() => {
    if (!isInView) {
      if (!latch) setIsSettled(false);
      return;
    }
    if (!settleMs) {
      setIsSettled(true);
      return;
    }
    const timer = window.setTimeout(() => setIsSettled(true), settleMs);
    return () => window.clearTimeout(timer);
  }, [isInView, latch, settleMs]);

  const classes = [
    className,
    "section-reveal",
    isReady ? "is-ready" : "",
    isInView ? "is-inview" : "",
    isSettled ? "is-settled" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={classes} {...props}>
      {children}
    </Tag>
  );
}
