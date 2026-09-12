"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ProofMedia } from "@/data/journey";

interface ProofImageProps {
  media: ProofMedia;
  variant?: "hero" | "polaroid" | "strip";
  sizes?: string;
}

export default function ProofImage({
  media,
  variant = "hero",
  sizes = "(max-width: 700px) 92vw, 42vw"
}: ProofImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className={`journey-proof is-${variant}`}
        onClick={() => setIsOpen(true)}
        aria-label={`View ${media.alt}`}
      >
        <span
          className="journey-proof-frame"
          style={{ position: "relative", display: "block", aspectRatio: media.aspectRatio || "16 / 10" }}
        >
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes={sizes}
            style={{ objectPosition: media.objectPosition || "50% 50%" }}
          />
        </span>
      </button>
      {isOpen && (
        <div className="journey-lightbox" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button
            ref={closeRef}
            type="button"
            className="journey-lightbox-backdrop"
            aria-label="Close image"
            onClick={() => setIsOpen(false)}
          />
          <figure>
            <Image
              src={media.src}
              alt={media.alt}
              width={1600}
              height={1000}
              sizes="92vw"
            />
            <figcaption id={titleId}>{media.caption || media.alt}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
