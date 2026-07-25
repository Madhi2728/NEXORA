const fs = require("fs");
const path = require("path");

const API_KEY = process.env.OCR_SPACE_API_KEY;

function isConfigured() {
  return Boolean(API_KEY);
}

/**
 * Sends the image to OCR.space and returns the extracted text.
 * OCREngine 2 is used because it generally handles messier/handwritten
 * text better than the default engine.
 */
async function recognizeText(absoluteFilePath) {
  if (!isConfigured()) {
    throw new Error("OCR.space is not configured (missing OCR_SPACE_API_KEY).");
  }

  const buffer = fs.readFileSync(absoluteFilePath);
  const blob = new Blob([buffer]);

  const formData = new FormData();
  formData.append("apikey", API_KEY);
  formData.append("language", "eng");
  formData.append("OCREngine", "2");
  formData.append("scale", "true");
  formData.append("isTable", "false");
  formData.append("file", blob, path.basename(absoluteFilePath));

  const response = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (result.IsErroredOnProcessing) {
    const message = Array.isArray(result.ErrorMessage)
      ? result.ErrorMessage.join(", ")
      : result.ErrorMessage || "OCR.space failed to process the image.";
    throw new Error(message);
  }

  const text = (result.ParsedResults || [])
    .map((r) => r.ParsedText)
    .join("\n")
    .trim();

  return text;
}

module.exports = { recognizeText, isConfigured };
