// backend/src/utils/documentStructurer.js
//
// Parses raw OCR text from a prescription or medical report into structured
// fields (patient/doctor/facility/date + a clean medications list) for the
// PDF header and dosage table. Tries OpenAI first, falls back to Groq using
// the same keys/models as openaiClient.js. Never throws -- returns a safe
// empty shape on any failure so OCR analysis can still complete.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.4-mini";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

const EXTRACTION_SYSTEM_PROMPT = `You extract structured data from OCR text of a medical prescription or report.
Return ONLY valid JSON, no markdown fences, no explanation, matching exactly this shape:
{
  "patientName": string or null,
  "doctorName": string or null,
  "facilityName": string or null,
  "documentDate": string or null,
  "vitals": {
    "bloodPressure": string or null,
    "temperature": string or null,
    "pulse": string or null,
    "respiratoryRate": string or null
  },
  "medications": [
    { "name": string, "dosage": string or null, "frequency": string or null, "route": string or null }
  ]
}
Rules:
- If a field isn't present in the text, use null (or [] for medications, or null for each vitals field).
- "dosage" is quantity/strength (e.g. "15 ml", "25 mg").
- "frequency" is how often/when to take it (e.g. "tid a.c.", "daily").
- "route" is how it's taken if stated (e.g. "oral", "topical"), else null.
- "bloodPressure" should include the unit if given (e.g. "140/90 mmHg").
- "temperature", "pulse", and "respiratoryRate" should include their units if given (e.g. "36.8 C", "76 bpm", "16/min").
- Keep names as close to the original OCR text as possible; do not invent data.`;

function safeParseJson(text) {
    if (!text) return null;
    const cleaned = text.replace(/```json|```/g, "").trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        return null;
    }
}

function emptyResult() {
    return {
        patientName: null,
        doctorName: null,
        facilityName: null,
        documentDate: null,
        medications: [],
    };
}

async function callOpenAIForStructure(ocrText) {
    if (!OPENAI_API_KEY) throw new Error("OpenAI is not configured (missing OPENAI_API_KEY).");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
                { role: "user", content: ocrText },
            ],
            max_completion_tokens: 600,
        }),
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
}

async function callGroqForStructure(ocrText) {
    if (!GROQ_API_KEY) throw new Error("Groq is not configured (missing GROQ_API_KEY).");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
                { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
                { role: "user", content: ocrText },
            ],
            max_tokens: 600,
            temperature: 0,
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * Turns raw OCR text into structured header + medication fields.
 * Never throws -- returns emptyResult() on any failure.
 */
async function structureDocument(ocrText) {
    if (!ocrText || !ocrText.trim()) return emptyResult();

    let raw = "";
    try {
        raw = await callOpenAIForStructure(ocrText);
    } catch (err) {
        console.warn("Document structuring: OpenAI failed, falling back to Groq:", err.message);
        try {
            raw = await callGroqForStructure(ocrText);
        } catch (err2) {
            console.error("Document structuring: Groq also failed:", err2.message);
            return emptyResult();
        }
    }

    const parsed = safeParseJson(raw);
    if (!parsed) {
        console.error("Document structuring: could not parse JSON from model response:", raw);
        return emptyResult();
    }
    console.log("Document structured OK:", {
        patientName: parsed.patientName,
        doctorName: parsed.doctorName,
        medicationsFound: parsed.medications?.length || 0,
    });

    return {
        patientName: parsed.patientName || null,
        doctorName: parsed.doctorName || null,
        facilityName: parsed.facilityName || null,
        documentDate: parsed.documentDate || null,
        medications: Array.isArray(parsed.medications) ? parsed.medications : [],
    };
}

module.exports = { structureDocument };