import { useEffect, useId, useRef } from "react";

// Six individual digit boxes: type to auto-advance, backspace to go back,
// paste a full code to fill them all. numeric + one-time-code so mobile OS
// autofill (which drops the whole code into the first box) still works.
export default function OtpInput({
  value = "",
  onChange,
  length = 6,
  disabled = false,
  autoFocus = false,
}) {
  const baseId = useId();
  const refs = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || "");

  function emit(next) {
    onChange(next.join("").slice(0, length));
  }

  function focusAt(i) {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    if (el) {
      el.focus();
      el.select?.();
    }
  }

  function handleChange(i, e) {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = digits.slice();
      next[i] = "";
      emit(next);
      return;
    }
    // One box, one keypress -> most common path. Multiple chars means a
    // paste-into-field or OS autofill: spread them from here on.
    const chars = raw.split("");
    const next = digits.slice();
    chars.forEach((c, k) => {
      if (i + k < length) next[i + k] = c;
    });
    emit(next);
    focusAt(i + chars.length);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.slice();
      if (digits[i]) {
        next[i] = "";
        emit(next);
      } else if (i > 0) {
        next[i - 1] = "";
        emit(next);
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!text) return;
    emit(text.split(""));
    focusAt(text.length - 1);
  }

  useEffect(() => {
    if (autoFocus) focusAt(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`${baseId}-otp-${i}`}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={i === 0 ? length : 1}
          disabled={disabled}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1} of ${length}`}
          className="h-12 w-11 rounded-md border border-input bg-background/50 text-center text-lg font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </div>
  );
}
