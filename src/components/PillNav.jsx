"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./PillNav.css";

function PillLink({ item, index, circleRefs, handleEnter, handleLeave }) {
  return (
    <a
      role="menuitem"
      href={item.href}
      className="pill"
      aria-label={item.ariaLabel || item.label}
      onMouseEnter={() => handleEnter(index)}
      onMouseLeave={() => handleLeave(index)}
    >
      <span
        className="hover-circle"
        aria-hidden="true"
        ref={el => {
          circleRefs.current[index] = el;
        }}
      />
      <span className="label-stack">
        <span className="pill-label">{item.label}</span>
        <span className="pill-label-hover" aria-hidden="true">
          {item.hoverLabel || item.label}
        </span>
      </span>
    </a>
  );
}

export default function PillNav({
  items,
  logo,
  logoAlt = "Logo",
  className = "",
  ease = "power3.easeOut",
  baseColor = "#19171f",
  pillColor = "#faf9fc",
  hoveredPillTextColor = "#faf9fc",
  pillTextColor = "#19171f"
}) {
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        if (w === 0 || h === 0) return;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector(".pill-label");
        const white = pill.querySelector(".pill-label-hover");

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: "auto" }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener("resize", onResize);
  }, [items, ease]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto"
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto"
    });
  };

  const cssVars = {
    "--base": baseColor,
    "--pill-bg": pillColor,
    "--hover-text": hoveredPillTextColor,
    "--pill-text": pillTextColor
  };

  const brand = items[0];
  const links = items.slice(1);

  return (
    <nav className={`pill-nav ${className}`} aria-label="Main navigation" style={cssVars}>
      <div className="brand">
        <a className="brand-mark" href={brand.href} aria-hidden="true" tabIndex={-1}>
          <img src={logo} alt="" width={38} height={38} />
        </a>
        <PillLink
          item={brand}
          index={0}
          circleRefs={circleRefs}
          handleEnter={handleEnter}
          handleLeave={handleLeave}
        />
      </div>
      <div className="pill-nav-items">
        <ul className="pill-list" role="menubar">
          {links.map((item, i) => (
            <li key={item.href || `item-${i}`} role="none">
              <PillLink
                item={item}
                index={i + 1}
                circleRefs={circleRefs}
                handleEnter={handleEnter}
                handleLeave={handleLeave}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
