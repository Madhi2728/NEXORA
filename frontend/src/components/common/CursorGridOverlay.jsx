import { useEffect, useState } from "react";

// A faint grid pattern that's only revealed in a soft circle around the
// cursor, fading out elsewhere. Purely decorative, sits behind all content.
export default function CursorGridOverlay() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    function handleMove(e) {
      setPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div
      className="cursor-grid-bg"
      style={{ "--gx": `${pos.x}px`, "--gy": `${pos.y}px` }}
      aria-hidden="true"
    />
  );
}
