import { useCallback, useRef, useState } from "react";
import { HeartPulse } from "lucide-react";

const SCROLL_SPEED = 60; // px/sec — pace of the continuous baseline sweep
const GAP_SPACING = 180; // px between brief gaps == 3s of travel at SCROLL_SPEED
const GAP_LENGTH = 8; // px — how wide each brief gap is
const TILE_WIDTH = GAP_SPACING * 3; // 540px; a multiple of GAP_SPACING so the loop is seamless

const SPIKE_WIDTH = 90;
// Stylized P-QRS-T trace: gentle rise (P), sharp down-up (QRS), settle (T).
const SPIKE_PATH = "M0 20 L14 20 L18 12 L22 20 L34 20 L36 24 L38 4 L42 34 L46 20 L54 20 L58 14 L62 20 L90 20";

function BaselineTile({ offset }) {
  return (
    <svg
      className="absolute top-0 h-full"
      style={{ left: offset, width: TILE_WIDTH }}
      viewBox={`0 0 ${TILE_WIDTH} 40`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="0"
        y1="20"
        x2={TILE_WIDTH}
        y2="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray={`${GAP_SPACING - GAP_LENGTH} ${GAP_LENGTH}`}
        className="text-primary/70"
      />
    </svg>
  );
}

function Spike({ x, onDone }) {
  return (
    <svg
      className="pointer-events-none absolute top-0 h-full ecg-spike-glow"
      style={{ left: x - SPIKE_WIDTH / 2, width: SPIKE_WIDTH }}
      viewBox={`0 0 ${SPIKE_WIDTH} 40`}
      preserveAspectRatio="none"
      onAnimationEnd={onDone}
      aria-hidden
    >
      <path
        d={SPIKE_PATH}
        pathLength="1"
        fill="none"
        stroke="var(--primary-color)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ecg-spike-play"
      />
    </svg>
  );
}

/**
 * A decorative, always-scrolling ECG baseline for the auth branding panel.
 * The line is solid and scrolls continuously; every ~3s a brief gap passes
 * through it as a visible motion cue. Clicking plays a one-shot heartbeat
 * spike in place at that x-position, then it flattens back out. Only one
 * spike can be active at a time — clicks are ignored (debounced) while a
 * pulse is still playing, so pulses never overlap.
 */
export function EcgPulse() {
  const [beat, setBeat] = useState(null);
  const [pulsingHeart, setPulsingHeart] = useState(false);
  const nextId = useRef(0);
  const pulsing = useRef(false);

  const handleClick = useCallback((e) => {
    if (pulsing.current) return; // debounce: ignore clicks while a pulse is still playing
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    pulsing.current = true;
    setBeat({ id: nextId.current++, x });

    setPulsingHeart(false);
    requestAnimationFrame(() => setPulsingHeart(true));
  }, []);

  const handleSpikeDone = useCallback(() => {
    pulsing.current = false;
    setBeat(null);
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Click anywhere on the line for a heartbeat"
      className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-background/30 px-4 py-3 text-left transition-colors hover:border-primary/50"
    >
      <HeartPulse className={`h-5 w-5 shrink-0 text-primary ${pulsingHeart ? "ecg-heart-beat" : ""}`} />
      <div className="relative h-8 w-full overflow-hidden">
        <div className="absolute inset-0 ecg-baseline-scroll ecg-baseline-glow">
          <BaselineTile offset={0} />
          <BaselineTile offset={TILE_WIDTH} />
        </div>
        {beat && <Spike key={beat.id} x={beat.x} onDone={handleSpikeDone} />}
      </div>
    </button>
  );
}
