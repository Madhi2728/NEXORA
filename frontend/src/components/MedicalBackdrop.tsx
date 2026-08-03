import { useEffect, useRef, useState, type ReactElement } from "react";

type Shape = {
  depth: number;
  className: string;
  el: ReactElement;

};

function Dna() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 4c0 14 28 18 28 28S18 46 18 60" />
      <path d="M46 4c0 14-28 18-28 28s28 14 28 28" />
      <path d="M22 14h20M20 24h24M20 40h24M22 50h20" />
    </svg>
  );
}


function Capsule() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="8" y="20" width="48" height="24" rx="12" />
      <path d="M32 20v24" />
    </svg>
  );
}

function Stethoscope() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6v14a12 12 0 0 0 24 0V6" />
      <path d="M30 32v8a14 14 0 0 0 28 0v-6" />
      <circle cx="58" cy="26" r="6" />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M26 6h12v20h20v12H38v20H26V38H6V26h20z" strokeLinejoin="round" />
    </svg>
  );
}

function Molecule() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="32" cy="32" r="7" />
      <circle cx="8" cy="14" r="5" />
      <circle cx="56" cy="16" r="5" />
      <circle cx="14" cy="54" r="5" />
      <circle cx="52" cy="52" r="5" />
      <path d="M27 27 12 18M37 28l15-8M28 37l-11 13M37 37l12 12" />
    </svg>
  );
}

const shapes: Shape[] = [
  { depth: 46, className: "left-[6%] top-[14%] h-28 w-28 text-primary/45", el: <Dna /> },
  { depth: 28, className: "right-[9%] top-[18%] h-24 w-24 text-accent/40", el: <Molecule /> },
  { depth: 62, className: "left-[16%] bottom-[14%] h-20 w-20 text-primary-glow/40", el: <Capsule /> },
  { depth: 36, className: "right-[14%] bottom-[18%] h-28 w-28 text-primary/40", el: <Stethoscope /> },
  { depth: 74, className: "left-1/2 -ml-7 top-[7.5rem] h-14 w-14 text-accent/30", el: <Cross /> },
];

const SPAN = 1200;
const SCROLL_MS = 12000;

type Beat = { id: number; x: number };

function ecgPath(beats: Beat[]) {
  const sorted = [...beats].sort((a, b) => a.x - b.x);
  let d = "M0 60";
  let cursor = 0;
  for (const b of sorted) {
    const start = Math.min(SPAN - 60, Math.max(0, b.x - 26));
    if (start < cursor) continue;
    d += `H${start.toFixed(1)} l8 6 l7 -11 l7 -38 l8 78 l7 -42 l8 7`;
    cursor = start + 45;
  }
  d += `H${SPAN - 36}`;
  return d;
}

export function MedicalBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const startRef = useRef(0);
  const lastBeatRef = useRef(0);
  const [beats, setBeats] = useState<Beat[]>([]);
  const [bump, setBump] = useState<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    startRef.current = performance.now();

    const addBeat = (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();
      if (clientY < r.top || clientY > r.bottom) return;
      const now = performance.now();
      if (now - lastBeatRef.current < 220) return;
      lastBeatRef.current = now;
      const off = (((now - startRef.current) % SCROLL_MS) / SCROLL_MS) * SPAN;
      const x = (((clientX - r.left) / r.width) * SPAN + off) % SPAN;
      const id = now;
      setBeats((prev) => [...prev.slice(-11), { id, x }]);
      window.setTimeout(() => setBeats((prev) => prev.filter((b) => b.id !== id)), SCROLL_MS);

      setBump({ id: now, x: clientX, y: clientY });
      window.setTimeout(() => setBump((prev) => (prev?.id === now ? null : prev)), 1000);
    };

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        node.style.setProperty("--mx", String(x));
        node.style.setProperty("--my", String(y));
        node.style.setProperty("--px", `${e.clientX}px`);
        node.style.setProperty("--py", `${e.clientY}px`);
      });
    };

    const onDown = (e: PointerEvent) => addBeat(e.clientX, e.clientY);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(frame);
    };
  }, []);

  const d = ecgPath(beats);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{
        perspective: "1000px",
        ["--mx" as string]: 0,
        ["--my" as string]: 0,
        ["--px" as string]: "50vw",
        ["--py" as string]: "50vh",
      }}
    >
      <div
        className="absolute inset-0 grid-veil"
        style={{
          maskImage:
            "radial-gradient(120px circle at var(--px) var(--py), #000 0%, rgba(0,0,0,0.55) 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(120px circle at var(--px) var(--py), #000 0%, rgba(0,0,0,0.55) 60%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(68px circle at var(--px) var(--py), oklch(0.78 0.16 300 / 16%), oklch(0.72 0.15 300 / 6%) 55%, transparent 78%)",
        }}
      />
      <div className="absolute left-1/2 top-[-20%] h-[60vh] w-[60vw] -translate-x-1/2 rounded-full bg-primary/25 blur-[140px]" />
      <div className="absolute bottom-[-25%] right-[-10%] h-[55vh] w-[45vw] rounded-full bg-accent/12 blur-[150px]" />

      <svg
        ref={svgRef}
        className="absolute inset-x-0 bottom-[6%] h-32 w-full text-primary/40"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <g className="ecg-scroll">
          <path d={d} strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} transform={`translate(${SPAN} 0)`} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>



      {shapes.map((s, i) => (
        <div
          key={i}
          className={`absolute floaty ${s.className}`}
          style={{
            transform:
              `translate3d(calc(var(--mx) * ${s.depth}px), calc(var(--my) * ${s.depth}px), 0)` +
              ` rotateX(calc(var(--my) * -14deg)) rotateY(calc(var(--mx) * 18deg))`,
            transition: "transform 220ms cubic-bezier(.22,.61,.36,1)",
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {s.el}
        </div>
      ))}

      {bump && (
        <div
          key={bump.id}
          className="pointer-events-none fixed glow-bump"
          style={{
            left: bump.x,
            top: bump.y,
            width: 140,
            height: 140,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, oklch(0.78 0.16 300 / 35%) 0%, oklch(0.72 0.15 300 / 10%) 45%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
}

