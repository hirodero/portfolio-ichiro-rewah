"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Plasma = dynamic(() => import("./Plasma"), { ssr: false });

export default function ContactPlasma() {
  const ref = useRef<HTMLDivElement>(null);
  const [isArmed, setIsArmed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsArmed(true);
      },
      { rootMargin: "240px 0px", threshold: 0 }
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="contact-plasma" aria-hidden="true">
      {isArmed ? (
        <Plasma
          color="#c4a8ff"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={1}
          mouseInteractive={true}
        />
      ) : null}
    </div>
  );
}
