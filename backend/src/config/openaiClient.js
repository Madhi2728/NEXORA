const API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";

function isConfigured() {
  return Boolean(API_KEY);
}

const SYSTEM_PROMPT = `You are the health information assistant inside the Nexora Health app.

Guidelines:
- Give general, educational health information only (conditions, medications, wellness, how to use this app).
- You are NOT a substitute for a doctor. Never give a definitive diagnosis. Never tell someone to start, stop, or change a prescription dose.
- For anything that sounds like it needs a professional (persistent or severe symptoms, medication questions specific to the person's situation, anything urgent), clearly recommend they see a doctor or pharmacist.
- If a message describes a possible medical emergency (chest pain, difficulty breathing, stroke symptoms, severe bleeding, suicidal thoughts, etc.), tell them clearly to seek emergency help immediately (call local emergency services) rather than continuing normal chat.
- Keep answers concise and easy to understand, avoid unnecessary jargon.
- Do not claim to access the person's personal medical records unless the app has explicitly given you that data in this conversation.`;

/**
 * Sends the conversation to OpenAI and returns the assistant's reply text.
 * `history` is an array of { role: "user"|"assistant", content: string }.
 */
async function getChatReply(history) {
  if (!isConfigured()) {
    throw new Error("OpenAI is not configured (missing OPENAI_API_KEY).");
  }

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

module.exports = { getChatReply, isConfigured };
