import { useMouseGlow } from "../../hooks/useMouseGlow";

export default function MouseGlowOverlay() {
  const { style } = useMouseGlow();
  return <div className="mouse-glow" style={style} aria-hidden="true" />;
}
