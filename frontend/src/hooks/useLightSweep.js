import { useEffect, useState } from "react";

export function useLightSweep() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e) {
      setPos({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return {
    style: {
      "--light-x": `${pos.x}px`,
      "--light-y": `${pos.y}px`,
    },
  };
}
