"use client";

import { useLayoutEffect, useRef, useState, type ElementType, type HTMLAttributes } from "react";
import "./SectionReveal.css";

interface SectionRevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  startInView?: boolean;
}

export default function SectionReveal({
  as: Tag = "section",
  className,
  startInView = false,
  children,
  ...props
}: SectionRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInView, setIsInView] = useState(startInView);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsReady(true);
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.14, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    setIsReady(true);
    return () => observer.disconnect();
  }, []);

  const classes = [
    className,
    "section-reveal",
    isReady ? "is-ready" : "",
    isInView ? "is-inview" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref} className={classes} {...props}>
      {children}
    </Tag>
  );
}
