// backend/src/config/openaiClient.js
//
// Sends the conversation to OpenAI first; if that fails (bad/expired key,
// rate limit, quota exceeded, network error), automatically retries with
// Groq using the same SYSTEM_PROMPT so the chatbot keeps working.
//
// .env needs (you already have both):
//   OPENAI_API_KEY=sk-...
//   OPENAI_MODEL=gpt-5.4-mini
//   GROQ_API_KEY=gsk_...
// Optional: CHAT_PROVIDER=openai | groq | auto   (default: auto)

const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

function isConfigured() {
  return Boolean(API_KEY) || Boolean(GROQ_API_KEY);
}

const SYSTEM_PROMPT = `You are the health information assistant inside the Nexora Health app.

Guidelines:
- Give general, educational health information only (conditions, medications, wellness, how to use this app).
- You are NOT a substitute for a doctor. Never give a definitive diagnosis. Never tell someone to start, stop, or change a prescription dose.
- For anything that sounds like it needs a professional (persistent or severe symptoms, medication questions specific to the person's situation, anything urgent), clearly recommend they see a doctor or pharmacist.
- If a message describes a possible medical emergency (chest pain, difficulty breathing, stroke symptoms, severe bleeding, suicidal thoughts, etc.), tell them clearly to seek emergency help immediately (call local emergency services) rather than continuing normal chat.
- Keep answers concise and easy to understand, avoid unnecessary jargon.
- Do not claim to access the person's personal medical records unless the app has explicitly given you that data in this conversation.`;

async function callOpenAI(history) {
  if (!API_KEY) throw new Error("OpenAI is not configured (missing OPENAI_API_KEY).");

  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGroq(history) {
  if (!GROQ_API_KEY) throw new Error("Groq is not configured (missing GROQ_API_KEY).");

  const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...history];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      max_tokens: 500,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

// Returns { reply, provider, fellBack } so callers (and the admin AI Monitor)
// can see which LLM answered and whether the primary one had to be bypassed.
async function getChatReply(history) {
  const mode = process.env.CHAT_PROVIDER || "auto";

  if (mode === "groq") {
    return { reply: await callGroq(history), provider: "groq", fellBack: false };
  }
  if (mode === "openai") {
    return { reply: await callOpenAI(history), provider: "openai", fellBack: false };
  }

  try {
    return { reply: await callOpenAI(history), provider: "openai", fellBack: false };
  } catch (err) {
    console.warn("OpenAI failed, falling back to Groq:", err.message);
    return { reply: await callGroq(history), provider: "groq", fellBack: true };
  }
}

module.exports = { getChatReply, isConfigured };