import { useEffect, useRef, useState } from "react";

export function useMouseGlow() {
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function handleMouseMove(e) {
      setGlowPos({ x: e.clientX, y: e.clientY });
      setIsMoving(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsMoving(false), 2500);
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    style: {
      "--glow-x": `${glowPos.x}px`,
      "--glow-y": `${glowPos.y}px`,
      "--glow-opacity": isMoving ? "1" : "0",
    },
  };
}
