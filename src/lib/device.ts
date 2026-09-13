export function skipGpuFx() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 700px), (pointer: coarse)").matches;
}
