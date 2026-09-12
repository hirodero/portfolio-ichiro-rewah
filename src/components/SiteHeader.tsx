"use client";

import PillNav from "./PillNav";

const items = [
  {
    label: (
      <>
        Ichiro Rewah<span className="brand-dot">.</span>
      </>
    ),
    href: "#top",
    ariaLabel: "Ichiro Rewah home"
  },
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Journey", href: "#journey" },
  { label: "Let’s talk ↗", href: "#contact", ariaLabel: "Let’s talk" }
];

export default function SiteHeader() {
  return (
    <div className="site-header-bar">
      <header className="site-header">
        <PillNav
          logo="/images/ichiro-rewah.jpg"
          logoAlt="Ichiro Rewah"
          items={items}
          className="site-pill-nav"
        />
      </header>
    </div>
  );
}
