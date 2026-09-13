"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Plasma = dynamic(() => import("./Plasma"), { ssr: false });

export default function ContactPlasma() {
  const ref = useRef<HTMLDivElement>(null);
  const [isArmed, setIsArmed] = useState(false);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const touchy = window.matchMedia("(pointer: coarse), (max-width: 700px)");
    const update = () => setInteractive(!touchy.matches);
    update();
    touchy.addEventListener("change", update);
    if (touchy.matches) {
      return () => touchy.removeEventListener("change", update);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsArmed(true);
      },
      { rootMargin: "240px 0px", threshold: 0 }
    );

    io.observe(node);
    return () => {
      touchy.removeEventListener("change", update);
      io.disconnect();
    };
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
          mouseInteractive={interactive}
        />
      ) : null}
    </div>
  );
}
