const items = [
  { image: "/images/gallery/speaking.jpg", text: "On stage" },
  { image: "/images/gallery/genz-berbakti.jpg", text: "Genera-Z Berbakti" },
  { image: "/images/gallery/team.jpg", text: "Malaka Scholarship" },
  { image: "/images/gallery/mentors.jpg", text: "With the team" },
  { image: "/images/gallery/first-place.jpg", text: "First place" }
];

export default function HeroGallery() {
  const loop = [...items, ...items];

  return (
    <div className="hero-gallery reveal" aria-hidden="true">
      <div className="hero-gallery-track">
        {loop.map((item, index) => (
          <figure className="hero-gallery-card" key={`${item.image}-${index}`}>
            <img src={item.image} alt="" width={240} height={360} decoding="async" />
            <figcaption>{item.text}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
