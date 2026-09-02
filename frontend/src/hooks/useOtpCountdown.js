// frontend/src/hooks/useOtpCountdown.js
//
// Drives a "Resend in 0:47" button. Call restart(seconds) after a code is
// sent (default: the cooldown passed in); secondsLeft ticks down to 0.

import { useCallback, useEffect, useState } from "react";

export function useOtpCountdown(cooldownSeconds = 60) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const restart = useCallback(
    (seconds = cooldownSeconds) => {
      setSecondsLeft(Math.max(0, Math.ceil(seconds)));
    },
    [cooldownSeconds],
  );

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return { secondsLeft, restart };
}
