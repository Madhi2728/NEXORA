const SELF_HARM_PATTERNS = [
  /\bsuicid/i,
  /\bkill myself\b/i,
  /\bwant to die\b/i,
  /\bend my life\b/i,
  /\bself[\s-]?harm/i,
  /\bhurt myself\b/i,
  /\boverdose\b.*\b(myself|on purpose|intentionally)\b/i,
];

const EMERGENCY_PATTERNS = [
  /\bchest pain\b/i,
  /\bcan'?t breathe\b/i,
  /\bdifficulty breathing\b/i,
  /\bstroke\b/i,
  /\bsevere bleeding\b/i,
  /\bunconscious\b/i,
  /\bheart attack\b/i,
  /\banaphyla/i,
];

function detectCrisis(message) {
  if (SELF_HARM_PATTERNS.some((p) => p.test(message))) return "self-harm";
  if (EMERGENCY_PATTERNS.some((p) => p.test(message))) return "medical-emergency";
  return null;
}

const RESPONSES = {
  "self-harm": `I'm really sorry you're going through this. Please reach out right now to someone who can help:

- **Tele-MANAS (India, 24/7, free): 14416** or **1-800-891-4416**
- If you're in immediate danger, call **112** (India's emergency number) or go to your nearest emergency room.

You don't have to go through this alone -- please talk to someone right now, even if it's a trusted friend or family member while you wait to connect with a counselor.`,

  "medical-emergency": `This sounds like it could be a medical emergency. Please don't wait for a chat response -- **call 112 (India's emergency number) or get to the nearest emergency room right now.**

If someone is with you, ask them to help you get there or to call for help.`,
};

module.exports = { detectCrisis, RESPONSES };
