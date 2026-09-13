import "./GlassIcons.css";

const gradientMapping = {
  blue: "linear-gradient(hsl(223, 28%, 28%), hsl(208, 24%, 22%))",
  purple: "linear-gradient(hsl(283, 22%, 28%), hsl(268, 20%, 22%))",
  red: "linear-gradient(hsl(3, 24%, 28%), hsl(348, 20%, 22%))",
  indigo: "linear-gradient(hsl(253, 22%, 28%), hsl(238, 20%, 22%))",
  orange: "linear-gradient(hsl(32, 24%, 26%), hsl(28, 18%, 20%))",
  green: "linear-gradient(hsl(138, 18%, 24%), hsl(128, 16%, 20%))"
};

function getBackgroundStyle(color) {
  if (gradientMapping[color]) {
    return { background: gradientMapping[color] };
  }
  return { background: color };
}

export default function GlassIcons({ items, className }) {
  return (
    <div className={`icon-btns ${className || ""}`}>
      {items.map((item, index) => (
        <div className="icon-motion-item" key={item.label || index} data-tool={item.label}>
          <button
            className={`icon-btn ${item.customClass || ""}`}
            aria-label={item.label}
            type="button"
          >
            <span className="icon-btn__back" style={getBackgroundStyle(item.color)} />
            <span className="icon-btn__front">
              <span className="icon-btn__icon" aria-hidden="true">
                {item.icon}
              </span>
            </span>
            <span className="icon-btn__label">{item.label}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
