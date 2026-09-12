"use client";

import { useEffect, useState } from "react";
import CircularGallery from "./CircularGallery";

const items = [
  { image: "/images/gallery/speaking.jpg", text: "On stage" },
  { image: "/images/gallery/genz-berbakti.jpg", text: "Genera-Z Berbakti" },
  { image: "/images/gallery/team.jpg", text: "Malaka Scholarship" },
  { image: "/images/gallery/mentors.jpg", text: "With the team" },
  { image: "/images/gallery/first-place.jpg", text: "First place" },
];

export default function HeroGallery() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 700px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="hero-gallery reveal">
      <CircularGallery
        items={items}
        bend={1.7}
        textColor="#f4eefc"
        borderRadius={0.08}
        autoSpeed={0.042}
        font="600 18px Arial, Helvetica, sans-serif"
      />
    </div>
  );
}
