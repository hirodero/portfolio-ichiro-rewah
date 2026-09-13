"use client";

import { useEffect, useState } from "react";
import { isHeroLive, subscribeHeroLive } from "@/lib/hero-focus";

import "./CircularText.css";

const CircularText = ({
  text,
  hoverText,
  spinDuration = 20,
  onHover = "speedUp",
  onActivate,
  className = ""
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const letters = Array.from(displayText);

  useEffect(() => {
    const sync = () => setPaused(!isHeroLive());
    sync();
    return subscribeHeroLive(sync);
  }, []);

  const handleHoverStart = () => {
    if (hoverText) setDisplayText(hoverText);
    if (!onHover || onHover === "pause") {
      setPaused(true);
      return;
    }
    setFast(true);
  };

  const handleHoverEnd = () => {
    setDisplayText(text);
    setFast(false);
    setPaused(!isHeroLive());
  };

  const handleActivate = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onActivate?.();
  };

  return (
    <div className={`circular-text-wrap ${className}`.trim()}>
      <button
        type="button"
        className="circular-text-hit"
        aria-label="Call Paimon"
        onMouseEnter={handleHoverStart}
        onMouseLeave={handleHoverEnd}
        onClick={handleActivate}
      />
      <div
        className={`circular-text${paused ? " is-paused" : ""}${fast ? " is-fast" : ""}`}
        style={{ "--spin-duration": `${spinDuration}s` }}
        aria-hidden="true"
      >
        {letters.map((letter, i) => {
          const rotationDeg = (360 / letters.length) * i;
          const factor = Math.PI / letters.length;
          const x = factor * i;
          const y = factor * i;
          const transform = `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;

          return (
            <span key={`${displayText}-${i}`} className="circular-letter" style={{ transform, WebkitTransform: transform }}>
              {letter}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CircularText;
