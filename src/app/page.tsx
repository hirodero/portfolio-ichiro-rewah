import SnowBackground from "@/components/SnowBackground";
import AboutProfile from "@/components/AboutProfile";
import AboutWaves from "@/components/AboutWaves";
import AuroraBackdrop from "@/components/AuroraBackdrop";
import AuraSplash from "@/components/AuraSplash";
import HeroText from "@/components/HeroText";
import HeroGallery from "@/components/HeroGallery";
import SectionReveal from "@/components/SectionReveal";
import SectionWind from "@/components/SectionWind";
import SiteHeader from "@/components/SiteHeader";
import { LiveSiteFrame } from "@/components/LiveSiteFrame";
import HeroBeacons from "@/components/HeroBeacons";
import TracingBeam from "@/components/TracingBeam";
import AboutToolkit from "@/components/AboutToolkit";
import JourneySection from "@/components/JourneySection";
import ContactPlasma from "@/components/ContactPlasma";
import { socials } from "@/data/socials";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6.4 9H4v11h2.4V9ZM5.2 4.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM20 20h-2.4v-5.5c0-1.7-.6-2.3-1.6-2.3s-1.8.8-1.8 2.4V20H12V9h2.3v1.4c.5-.9 1.6-1.6 3.1-1.6 2.1 0 2.6 1.5 2.6 4.1V20Z" />
    </svg>
  );
}

const socialIcons = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon
} as const;

interface HomeProps {
  searchParams: Promise<{ preview?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  return (
    <main id="top">
      <a className="skip-link" href="#content">Skip to content</a>
      <SiteHeader />
      <SectionReveal className="hero-shell" startInView aria-labelledby="hero-title">
        {isPreview ? null : <SnowBackground />}
        {isPreview ? null : <HeroBeacons />}
        {isPreview ? null : <SectionWind variant="hero" />}
        <div className="site-header-slot" aria-hidden="true" />
        <div className="hero-content" id="content">
          <div className="intro-pill reveal">
            <span className="status-dot" />
            <HeroText text="A little about me, a lot about what I build" particles={false} />
          </div>
          <p className="eyebrow reveal">
            <HeroText text="HELLO, I’M ICHIRO" fontWeight={500} particles={false} />
          </p>
          <h1 id="hero-title" className="reveal">
            <HeroText className="hero-title-line" text="Thoughtful code." fontWeight={600} particleSize={2} density={4} scatter={140} gatherDuration={1500} stagger={380} glow />
            <HeroText className="hero-title-line" text="Memorable experiences." fontWeight={600} particleSize={2} density={4} scatter={140} gatherDuration={1500} stagger={380} glow />
          </h1>
          <p className="hero-description reveal">
            <HeroText className="hero-desc-line" text="Turning ideas into things you can click, explore, and enjoy." particles={false} />
            <HeroText className="hero-desc-line" text="Welcome to my little corner of the internet." particles={false} />
          </p>
          <div className="hero-actions reveal">
            <a className="button button-primary" href="#work">
              <HeroText text="Explore my work" fontWeight={600} color="#15121a" particles={false} />
              <Arrow />
            </a>
            <a className="button button-secondary" href="#about">
              <HeroText text="More about me" fontWeight={600} particles={false} />
            </a>
          </div>
          <div className="stack reveal">
            <HeroText text="BUILT WITH" particles={false} />
            <span><b aria-hidden="true">N</b> <HeroText text="Next.js" particles={false} /></span>
            <span><b className="ts-icon" aria-hidden="true">TS</b> <HeroText text="TypeScript" particles={false} /></span>
            <span><b className="react-icon" aria-hidden="true">⚛</b> <HeroText text="React" particles={false} /></span>
          </div>
        </div>
        {isPreview ? null : <HeroGallery />}
        <a className="scroll-cue reveal" href="#about"><span /> Scroll to explore</a>
        <span className="hero-note">
          <span className="reveal">
            <HeroText text="A work in progress. Just like me." particles={false} />
          </span>
        </span>
      </SectionReveal>

      <SectionReveal className="section about-section" id="about" aria-labelledby="about-title" latch>
        {isPreview ? null : <AboutWaves />}
        <SectionWind>
        <p className="eyebrow about-kicker reveal">01 / BEHIND THE SCREEN</p>
        <AboutProfile />
        <div className="about-copy">
          <AuroraBackdrop idPrefix="about-copy" wide />
          {isPreview ? null : <AuraSplash />}
          <h2 id="about-title" className="reveal">Curiosity is<br />part of the process<span>.</span></h2>
          <p className="reveal">I’m Ichiro Rewah. I enjoy bringing ideas to life on the web, with an eye for the details that make an interface feel considered.</p>
          <p className="reveal">This is where I share what I make and what I’m exploring. My approach is simple: stay curious, keep learning, and make each iteration a little better.</p>
          <div className="about-details reveal"><span><span className="status-dot" /> Always learning</span><span>One commit at a time ↗</span></div>
        </div>
        <AboutToolkit />
        </SectionWind>
      </SectionReveal>

      <TracingBeam>
      <SectionReveal className="section work-section" id="work" aria-labelledby="work-title" latch>
        <div className="section-heading reveal"><div><p className="eyebrow">02 / SELECTED WORK</p><h2 id="work-title">From idea to interface<span>.</span></h2></div><p>A space for the things I’m building.<br />More projects are on the way.</p></div>
        <div className="project-grid">
          <a className="project-card reveal" href="#top" aria-label="Explore this portfolio project">
            <div className="project-art portfolio-art">
              <LiveSiteFrame
                src="https://portfolio-ichiro-rewah.vercel.app/?preview=1"
                fallbackSrc="/images/work/portfolio-hero.jpg"
                title="Portfolio live preview"
              />
              <span className="project-number">01</span>
            </div>
            <div className="project-info"><div><span className="project-category">PERSONAL WEBSITE · 2026</span><h3>My corner of the internet</h3></div><span className="project-arrow"><Arrow /></span></div>
            <p>A minimal portfolio with a little motion and a personal touch.</p><div className="tags"><span>Next.js</span><span>TypeScript</span><span>Three.js</span></div>
          </a>
          <a className="project-card reveal" href="https://kerjawoy.id/detail" target="_blank" rel="noreferrer" aria-label="Open KerjaWoy">
            <div className="project-art kerjawoy-art">
              <LiveSiteFrame
                src="https://kerjawoy.id/detail"
                fallbackSrc="/images/work/kerjawoy.jpg"
                title="KerjaWoy live preview"
              />
              <span className="project-number">02</span>
            </div>
            <div className="project-info"><div><span className="project-category">JOB PORTAL · 2026</span><h3>KerjaWoy</h3></div><span className="project-arrow"><Arrow /></span></div>
            <p>A verified path from preparation to placement for people ready to work abroad.</p><div className="tags"><span>Product</span><span>Web</span></div>
          </a>
          <a className="project-card reveal" href="https://zenleap.id/program/english" target="_blank" rel="noreferrer" aria-label="Open ZenLEAP">
            <div className="project-art zenleap-art">
              <LiveSiteFrame
                src="https://zenleap.id/program/english"
                fallbackSrc="/images/work/zenleap-english.jpg"
                title="ZenLEAP live preview"
              />
              <span className="project-number">03</span>
            </div>
            <div className="project-info"><div><span className="project-category">ADAPTIVE LEARNING · 2026</span><h3>ZenLEAP</h3></div><span className="project-arrow"><Arrow /></span></div>
            <p>An AI-powered adaptive learning web app for multiple languages, with practice that adjusts to each learner.</p><div className="tags"><span>AI</span><span>Product</span><span>Web</span></div>
          </a>
          <a className="project-card reveal" href="https://minaesa-platform.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open MINAESA">
            <div className="project-art minaes-art">
              <LiveSiteFrame
                src="https://minaesa-platform.vercel.app/"
                fallbackSrc="/images/work/minaesa.avif"
                title="MINAESA live preview"
              />
              <span className="project-number">04</span>
            </div>
            <div className="project-info"><div><span className="project-category">CULTURAL PLATFORM · 2026</span><h3>MINAESA</h3></div><span className="project-arrow"><Arrow /></span></div>
            <p>A community-owned digital ecosystem for MAPALUS — connecting UMKM, cultural heritage, and tourism in Kakaskasen Dua.</p><div className="tags"><span>Product</span><span>Web</span></div>
          </a>
          <a className="project-card reveal" href="https://cuanversedigital.id/" target="_blank" rel="noreferrer" aria-label="Open CuanVerse">
            <div className="project-art cuanverse-art">
              <LiveSiteFrame
                src="https://cuanversedigital.id/"
                fallbackSrc="/images/work/cuanverse.svg"
                title="CuanVerse live preview"
              />
              <span className="project-number">05</span>
            </div>
            <div className="project-info"><div><span className="project-category">VIDEO LEARNING · 2026</span><h3>CuanVerse</h3></div><span className="project-arrow"><Arrow /></span></div>
            <p>A video-based learning platform designed to complement e-books with structured lessons on personal branding and digital products.</p><div className="tags"><span>Product</span><span>Web</span><span>Learning</span></div>
          </a>
        </div>
      </SectionReveal>

      <SectionReveal className="journey-shell" id="journey" aria-labelledby="journey-title" latch>
        <JourneySection />
      </SectionReveal>
      </TracingBeam>

      <SectionReveal className="section contact-section" id="contact" aria-labelledby="contact-title" startInView>
        {isPreview ? null : <ContactPlasma />}
        <p className="eyebrow reveal">04 / SAY HELLO</p>
        <h2 id="contact-title" className="reveal">Good things start<br />with a conversation<span>.</span></h2>
        <p className="reveal">If something here resonates, I’d like to hear from you.</p>
        <div className="contact-socials reveal">
          {socials.map((item) => {
            const Icon = socialIcons[item.name as keyof typeof socialIcons];
            return (
              <a key={item.name} href={item.href} target="_blank" rel="noreferrer" aria-label={item.label}>
                <Icon />
              </a>
            );
          })}
        </div>
        <footer className="footer">
          <a className="brand" href="#top">Ichiro Rewah.</a>
          <span>© {new Date().getFullYear()} · Made with curiosity.</span>
          <a href="#top">Back to top ↑</a>
        </footer>
      </SectionReveal>
    </main>
  );
}
