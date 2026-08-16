import { useEffect, useRef } from "react";
import { Activity, HeartPulse, Pill, Stethoscope, Syringe, Thermometer } from "lucide-react";

const FLOATERS = [
  { Icon: HeartPulse, top: "12%", left: "8%", size: 44, delay: "0s", depth: 26 },
  { Icon: Stethoscope, top: "68%", left: "12%", size: 52, delay: "1.4s", depth: 18 },
  { Icon: Pill, top: "22%", left: "82%", size: 38, delay: "2.2s", depth: 34 },
  { Icon: Syringe, top: "74%", left: "78%", size: 42, delay: "0.8s", depth: 22 },
  { Icon: Activity, top: "44%", left: "48%", size: 60, delay: "3s", depth: 12 },
  { Icon: Thermometer, top: "8%", left: "56%", size: 34, delay: "1.9s", depth: 30 },
];

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        el.style.setProperty("--mx", `${e.clientX}px`);
        el.style.setProperty("--my", `${e.clientY}px`);
        el.style.setProperty("--px", `${x}`);
        el.style.setProperty("--py", `${y}`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ ["--mx" as string]: "50vw", ["--my" as string]: "40vh", ["--px" as string]: "0", ["--py" as string]: "0" }}
    >
      <div className="absolute inset-0 bg-background" />
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--lavender-color) 40%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--lavender-color) 40%, transparent) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(circle at 50% 30%, black, transparent 78%)",
        }}
      />
      <div
        className="absolute -left-32 top-[-10%] h-[38rem] w-[38rem] rounded-full blur-[120px] pulse-soft"
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--amethyst-color) 65%, transparent), transparent 70%)",
          transform: "translate3d(calc(var(--px) * 40px), calc(var(--py) * 40px), 0)",
        }}
      />
      <div
        className="absolute -right-24 bottom-[-15%] h-[34rem] w-[34rem] rounded-full blur-[130px] pulse-soft"
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--vitality-color) 45%, transparent), transparent 70%)",
          transform: "translate3d(calc(var(--px) * -50px), calc(var(--py) * -50px), 0)",
        }}
      />

      {FLOATERS.map(({ Icon, top, left, size, delay, depth }, i) => (
        <div
          key={i}
          className="absolute float-slow"
          style={{
            top,
            left,
            animationDelay: delay,
            transform: `translate3d(calc(var(--px) * ${depth}px), calc(var(--py) * ${depth}px), 0)`,
          }}
        >
          <Icon
            size={size}
            className="text-lavender/25"
            style={{ filter: "drop-shadow(0 14px 28px color-mix(in oklab, var(--amethyst-color) 55%, transparent))" }}
          />
        </div>
      ))}

      <div
        className="absolute h-[26rem] w-[26rem] rounded-full blur-[90px] transition-opacity"
        style={{
          left: "var(--mx)",
          top: "var(--my)",
          marginLeft: "-13rem",
          marginTop: "-13rem",
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary-color) 42%, transparent), color-mix(in oklab, var(--vitality-color) 12%, transparent) 45%, transparent 70%)",
        }}
      />
    </div>
  );
}
