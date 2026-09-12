"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation, useMotionValue } from "motion/react";

import "./CircularText.css";

const getRotationTransition = (duration, from, loop = true) => ({
  from,
  to: from + 360,
  ease: "linear",
  duration,
  type: "tween",
  repeat: loop ? Infinity : 0
});

const CircularText = ({
  text,
  hoverText,
  spinDuration = 20,
  onHover = "speedUp",
  onActivate,
  className = ""
}) => {
  const [displayText, setDisplayText] = useState(text);
  const letters = Array.from(displayText);
  const controls = useAnimation();
  const rotation = useMotionValue(0);

  const spin = (duration) => {
    const start = rotation.get();
    controls.start({
      rotate: start + 360,
      transition: {
        rotate: getRotationTransition(duration, start)
      }
    });
  };

  useEffect(() => {
    spin(spinDuration);
  }, [spinDuration, controls, rotation]);

  const hoverDuration = () => {
    if (onHover === "slowDown") return spinDuration * 2;
    if (onHover === "speedUp") return spinDuration / 4;
    if (onHover === "goBonkers") return spinDuration / 20;
    return spinDuration;
  };

  const handleHoverStart = () => {
    if (hoverText) setDisplayText(hoverText);
    if (!onHover || onHover === "pause") {
      controls.stop();
      return;
    }
    spin(hoverDuration());
  };

  const handleHoverEnd = () => {
    setDisplayText(text);
    spin(spinDuration);
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
      <motion.div
        className="circular-text"
        style={{ rotate: rotation }}
        initial={{ rotate: 0 }}
        animate={controls}
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
      </motion.div>
    </div>
  );
};

export default CircularText;
