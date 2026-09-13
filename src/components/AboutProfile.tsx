"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { skipGpuFx } from "@/lib/device";
import ProfileCard from "./ProfileCard";
import DriftWall from "./DriftWall";
import "./AboutProfile.css";

const DRIFT_ITEMS = [
  { image: "/images/drift/kerjawoy-jobs.jpg", title: "KerjaWoy jobs" },
  { image: "/images/drift/kerjawoy-landing.jpg", title: "KerjaWoy" },
  { image: "/images/drift/zenleap-english.jpg", title: "ZenLEAP English" },
  { image: "/images/drift/zenleap-quiz.jpg", title: "ZenLEAP program" },
  { image: "/images/drift/zenleap-courses.jpg", title: "ZenLEAP courses" },
  { image: "/images/drift/zenvokus.jpg", title: "ZenVokus" },
  { image: "/images/drift/zenvokus-practice.jpg", title: "Quick practice" },
  { image: "/images/drift/genz-berbakti.jpg", title: "Genera-Z Berbakti" },
  { image: "/images/drift/ichiro-presenting.jpg", title: "Speaking" }
];

export default function AboutProfile() {
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [showDrift, setShowDrift] = useState(true);
  const profileRef = useRef<HTMLElement>(null);

  const syncRoomFlashOrigin = useCallback(() => {
    const section = document.getElementById("about");
    const led = profileRef.current?.querySelector(".phone-flash-led");
    if (!section || !led) return;

    const sectionRect = section.getBoundingClientRect();
    const lightRect = led.getBoundingClientRect();
    // The room light spans the viewport, independently of either card's bounds.
    section.style.setProperty("--room-flash-left", `${-sectionRect.left}px`);
    section.style.setProperty("--room-flash-width", `${document.documentElement.clientWidth}px`);
    section.style.setProperty("--room-flash-x", `${lightRect.left + lightRect.width / 2}px`);
    section.style.setProperty("--room-flash-y", `${lightRect.top + lightRect.height / 2 - sectionRect.top}px`);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)");
    const update = () => setTiltEnabled(preference.matches);
    update();
    preference.addEventListener("change", update);
    const isLite = skipGpuFx()
      || window.self !== window.top
      || new URLSearchParams(window.location.search).has("preview");
    setShowDrift(!isLite);
    if (isLite) return () => preference.removeEventListener("change", update);

    const warm = () => {
      DRIFT_ITEMS.forEach(({ image }) => {
        const img = new Image();
        img.decoding = "async";
        img.src = image;
      });
      const avatar = new Image();
      avatar.decoding = "async";
      avatar.src = "/images/ichiro-rewah.jpg";
    };
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });

    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = document.getElementById("about");
    if (!section) return;

    syncRoomFlashOrigin();
    const frame = window.requestAnimationFrame(syncRoomFlashOrigin);
    window.addEventListener("resize", syncRoomFlashOrigin);
    const observer = new ResizeObserver(syncRoomFlashOrigin);
    observer.observe(section);
    const profile = profileRef.current;
    profile?.addEventListener("pointermove", syncRoomFlashOrigin);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncRoomFlashOrigin);
      observer.disconnect();
      profile?.removeEventListener("pointermove", syncRoomFlashOrigin);
    };
  }, [syncRoomFlashOrigin]);

  return <aside ref={profileRef} className="about-profile" aria-label="Meet Ichiro Rewah">
    {showDrift ? (
    <div className="profile-drift">
      <DriftWall
        items={DRIFT_ITEMS}
        columns={4}
        tileWidth={200}
        tileHeight={132}
        gap={18}
        tilt={14}
        turn={-12}
        roll={-6}
        perspective={980}
        depth={70}
        speed={28}
        direction="up"
        variance={0.3}
        parallax={0}
        lift={0}
        fade={0.16}
        dim={0.92}
        overlayColor="#100e15"
        scale={0.78}
      />
    </div>
    ) : null}
    <div className="about-profile-card reveal">
    <ProfileCard
      name="Ichiro Rewah"
      title="Software Developer"
      handle="ichirorewah"
      status="Let’s connect"
      contactText="Say hello ↗"
      avatarUrl="/images/ichiro-rewah.jpg"
      miniAvatarUrl="/images/ichiro-rewah.jpg"
      showUserInfo={true}
      enableTilt={tiltEnabled}
      enablePhoneFlash={true}
      onPhoneFlashChange={syncRoomFlashOrigin}
      enableMobileTilt={false}
      onContactClick={() => { window.location.hash = "contact"; }}
      iconUrl="/images/profile-pattern.svg"
      grainUrl=""
      behindGlowEnabled={false}
      behindGlowColor="rgba(151, 114, 187, 0.28)"
      behindGlowSize="65%"
      innerGradient="linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"
    />
    </div>
  </aside>;
}
