import type { ReactNode } from "react";
import GlassIcons from "./GlassIcons";
import { toolkitIcons } from "./TechIcons";
import { capabilities, toolkit } from "@/data/toolkit";
import "./AboutToolkit.css";

export default function AboutToolkit() {
  const items = toolkit.map((item) => {
    const Icon = toolkitIcons[item.name as keyof typeof toolkitIcons];
    return {
      icon: Icon ? <Icon /> : (null as unknown as ReactNode),
      color: item.color,
      label: item.name,
      customClass: item.customClass
    };
  });

  return (
    <aside className="about-toolkit" aria-label="Tools I keep close">
      <p className="about-toolkit-label">Tools I keep close</p>
      <div className="toolkit-motion">
        <GlassIcons items={items} className="about-toolkit-icons" />
      </div>
      <p className="about-toolkit-capabilities">
        {capabilities.slice(0, 3).join(" · ")}
        <br />
        {capabilities.slice(3).join(" · ")}
      </p>
    </aside>
  );
}
