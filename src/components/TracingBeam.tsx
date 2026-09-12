"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import "./TracingBeam.css";

interface TracingBeamProps {
  children: ReactNode;
}

export default function TracingBeam({ children }: TracingBeamProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const update = () => setSvgHeight(Math.max(0, node.offsetHeight - 148));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [50, svgHeight]), {
    stiffness: 500,
    damping: 90
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [50, Math.max(50, svgHeight - 200)]), {
    stiffness: 500,
    damping: 90
  });

  return (
    <div className="tracing-beam" ref={wrapRef}>
      <div className="tracing-beam-rail" aria-hidden="true">
        <motion.div
          className="tracing-beam-head"
          transition={{ duration: 0.2, delay: 0.5 }}
        >
          <motion.span
            className="tracing-beam-dot"
            transition={{ duration: 0.2, delay: 0.5 }}
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${Math.max(svgHeight, 1)}`}
          width="20"
          height={svgHeight}
          className="tracing-beam-svg"
        >
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
          />
          <motion.path
            d={`M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`}
            fill="none"
            stroke="url(#work-journey-beam)"
            strokeWidth="1.25"
            className="tracing-beam-glow"
          />
          <defs>
            <motion.linearGradient
              id="work-journey-beam"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div className="tracing-beam-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
