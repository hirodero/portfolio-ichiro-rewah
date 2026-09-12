import Image from "next/image";
import { journey } from "@/data/journey";
import JourneyFeature from "./JourneyFeature";
import ProofImage from "./ProofImage";
import "./JourneySection.css";

function RecognitionCard({
  label,
  title,
  status,
  period,
  highlight,
  detail,
  description,
  variant,
  proofMedia
}: (typeof journey.recognition)[number]) {
  const proof = proofMedia?.[0];

  return (
    <article className={`journey-card journey-recognition is-${variant} reveal`}>
      <span className="journey-watermark" aria-hidden="true">
        <b>{highlight[0]}</b>
        <b>{highlight[1]}</b>
      </span>
      <header>
        <p className="journey-kicker">{label}</p>
        <p className="journey-meta">
          <span>{status}</span>
          <span>{period}</span>
        </p>
        <h3>
          {title.split("\n").map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
      </header>
      <p className="journey-highlight">{highlight[0]}<br />{highlight[1]}</p>
      {variant === "scholarship" ? (
        <div className="journey-recognition-split">
          {proof && (
            <ProofImage
              media={proof}
              variant="polaroid"
              sizes="(max-width: 700px) 54vw, 180px"
            />
          )}
          <p className="journey-detail">{detail}</p>
        </div>
      ) : (
        <p className="journey-detail">{detail}</p>
      )}
      {variant === "finalist" && proof && (
        <ProofImage
          media={proof}
          variant="strip"
          sizes="(max-width: 700px) 92vw, 380px"
        />
      )}
      <p>{description}</p>
    </article>
  );
}

function CollaborationCard({
  title,
  role,
  period,
  description,
  organizations,
  proofMedia
}: (typeof journey.collaboration)[number]) {
  const proof = proofMedia?.[0];

  return (
    <article className="journey-card journey-collab reveal">
      {proof && (
        <ProofImage
          media={proof}
          variant="hero"
          sizes="(max-width: 700px) 92vw, 42vw"
        />
      )}
      <header>
        <p className="journey-kicker">Collaboration</p>
        <h3>{title}</h3>
        <p className="journey-meta">
          <span>{role}</span>
          <span>{period}</span>
        </p>
      </header>
      <div className="journey-partners" aria-label={`${organizations[0]} and ${organizations[1]}`}>
        <span className="journey-partner">{organizations[0]}</span>
        <span className="journey-times" aria-hidden="true">×</span>
        <span className="journey-partner">RISTEK UI</span>
      </div>
      <p>{description}</p>
    </article>
  );
}

function EducationBlock({
  label,
  school,
  program,
  degree,
  start,
  end,
  location,
  progress,
  mark,
  markFit = "cover"
}: (typeof journey.education)[number]) {
  const subtitle = degree ? `${program} · ${degree}` : program;

  return (
    <article className="journey-education reveal">
      <p className="journey-kicker">{label}</p>
      <div className="journey-track" aria-hidden="true">
        <span>{start}</span>
        <span className="journey-line">
          <i style={{ width: `${Math.round(progress * 100)}%` }} />
        </span>
        <span>{end}</span>
      </div>
      <div className="journey-edu-copy">
        {mark && (
          <span className={`journey-edu-mark is-${markFit}`}>
            <Image src={mark.src} alt={mark.alt} width={160} height={160} />
          </span>
        )}
        <div className="journey-edu-text">
          <h3>{school}</h3>
          <p className="journey-degree">{subtitle}</p>
          <p className="journey-detail">{location}</p>
        </div>
      </div>
    </article>
  );
}

export default function JourneySection() {
  const [feature] = journey.community;
  const [collaboration] = journey.collaboration;
  const { recognition, education, certifications } = journey;

  return (
    <>
      <div className="journey-lights" aria-hidden="true">
        <span className="journey-light journey-light-purple" />
        <span className="journey-light journey-light-green" />
      </div>
      <div className="section journey-inner">
        <header className="journey-heading">
          <div>
            <p className="eyebrow reveal">03 / ALONG THE WAY</p>
            <h2 id="journey-title" className="reveal">Some things aren’t<br />measured in commits<span>.</span></h2>
          </div>
          <p className="reveal">Communities I’ve helped build,<br />milestones along the way,<br />and the places I continue to learn from.</p>
        </header>
        <div className="journey-layout">
          <span className="journey-thread" aria-hidden="true" />
          <div className="journey-stack">
            <JourneyFeature item={feature} />
            <CollaborationCard {...collaboration} />
          </div>
          <div className="journey-recognition-col">
            {recognition.map((item) => (
              <RecognitionCard key={item.id} {...item} />
            ))}
          </div>
          <div className="journey-education-list">
            {education.map((item) => (
              <EducationBlock key={item.id} {...item} />
            ))}
          </div>
          {certifications.length > 0 && (
            <div className="journey-certs">
              {certifications.map((item) => (
                <article key={item.id} className="journey-cert reveal">
                  <p className="journey-kicker">{item.issuer}</p>
                  <h3>{item.name}</h3>
                  <p className="journey-detail">{item.year}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
