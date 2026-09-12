export interface ToolkitItem {
  name: string;
  color: string;
  customClass: string;
}

export const toolkit: ToolkitItem[] = [
  { name: "Next.js", color: "#2a2433", customClass: "is-a" },
  { name: "React", color: "#1d3140", customClass: "is-b" },
  { name: "TypeScript", color: "#24344a", customClass: "is-c" },
  { name: "Claude Code", color: "#3a2d28", customClass: "is-d" },
  { name: "Node.js", color: "#243528", customClass: "is-e" },
  { name: "GitHub", color: "#2c2733", customClass: "is-f" },
  { name: "MySQL", color: "#2a3344", customClass: "is-g" },
  { name: "JavaScript", color: "#3a3420", customClass: "is-h" }
];

export const capabilities = [
  "AI-assisted development",
  "Prompt design",
  "UI/UX",
  "Responsive interfaces",
  "Performance optimization"
];
