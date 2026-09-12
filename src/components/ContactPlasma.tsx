"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Plasma = dynamic(() => import("./Plasma"), { ssr: false });

export default function ContactPlasma() {
  const ref = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsActive(true);
      },
      { rootMargin: "240px 0px" }
    );

    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="contact-plasma" aria-hidden="true">
      {isActive ? (
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
