type FocusListener = (focused: boolean) => void;
type LiveListener = () => void;
type HeroGpuLane = "snow" | "rays";

const focusListeners = new Set<FocusListener>();
const liveListeners = new Set<LiveListener>();
const gpuLanes = new Map<HeroGpuLane, (now: number) => void>();
const lastDrawn: Record<HeroGpuLane, number> = { snow: 0, rays: 0 };

let focused = true;
let scrolling = false;
let hidden = false;
let installed = false;
let scrollTimer = 0;
let gpuRaf = 0;
let lastLane: HeroGpuLane = "rays";
let lastScrollY = 0;
let scrollingUp = false;

export function isHeroFocused() {
  return focused;
}

export function isHeroScrolling() {
  return scrolling;
}

export function isHeroLive() {
  return focused && !hidden;
}

function emitLive() {
  liveListeners.forEach((listener) => listener());
}

function gpuTick(now: number) {
  if (!isHeroLive() || gpuLanes.size === 0) {
    gpuRaf = 0;
    return;
  }

  const gap = scrolling ? 56 : 40;
  const order: HeroGpuLane[] = scrolling && !scrollingUp
    ? ["snow"]
    : lastLane === "snow" ? ["rays", "snow"] : ["snow", "rays"];
  for (const lane of order) {
    const render = gpuLanes.get(lane);
    if (!render || now - lastDrawn[lane] < gap) continue;
    lastDrawn[lane] = now;
    lastLane = lane;
    render(now);
    break;
  }

  gpuRaf = requestAnimationFrame(gpuTick);
}

export function kickHeroGpu() {
  ensureInstalled();
  if (gpuRaf || !isHeroLive() || gpuLanes.size === 0) return;
  gpuRaf = requestAnimationFrame(gpuTick);
}

export function registerHeroGpu(lane: HeroGpuLane, render: (now: number) => void) {
  ensureInstalled();
  gpuLanes.set(lane, render);
  kickHeroGpu();
  return () => {
    if (gpuLanes.get(lane) !== render) return;
    gpuLanes.delete(lane);
    if (gpuLanes.size === 0 && gpuRaf) {
      cancelAnimationFrame(gpuRaf);
      gpuRaf = 0;
    }
  };
}

export function setHeroFocused(next: boolean) {
  ensureInstalled();
  if (focused === next) return;
  focused = next;
  focusListeners.forEach((listener) => listener(focused));
  emitLive();
  if (isHeroLive()) kickHeroGpu();
}

export function setHeroScrolling(next: boolean) {
  ensureInstalled();
  if (scrolling === next) return;
  scrolling = next;
  emitLive();
  if (isHeroLive()) kickHeroGpu();
}

export function subscribeHeroFocus(listener: FocusListener) {
  ensureInstalled();
  focusListeners.add(listener);
  listener(focused);
  return () => {
    focusListeners.delete(listener);
  };
}

export function subscribeHeroLive(listener: LiveListener) {
  ensureInstalled();
  liveListeners.add(listener);
  listener();
  return () => {
    liveListeners.delete(listener);
  };
}

function markScroll(force = false) {
  const y = window.scrollY;
  const delta = y - lastScrollY;
  scrollingUp = delta < 0;
  lastScrollY = y;
  if (!force && !scrolling && Math.abs(delta) < 8) return;
  setHeroScrolling(true);
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => setHeroScrolling(false), 180);
}

function ensureInstalled() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  hidden = document.hidden;
  lastScrollY = window.scrollY;

  window.addEventListener("scroll", () => markScroll(), { passive: true });
  window.addEventListener("scrollend", () => {
    window.clearTimeout(scrollTimer);
    setHeroScrolling(false);
  });
  window.addEventListener("hashchange", () => markScroll(true));
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a[href^="#"]')) markScroll(true);
  });
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    emitLive();
    if (isHeroLive()) kickHeroGpu();
  });
}
