const Tesseract = require("tesseract.js");
const azureVision = require("../config/azureVision");
const ocrSpace = require("../config/ocrSpace");

/**
 * Runs OCR on the given image and returns the extracted text.
 * Provider priority: Azure Vision > OCR.space > Tesseract (fallback).
 */
async function recognizeText(absoluteFilePath) {
  if (azureVision.isConfigured()) {
    return azureVision.recognizeText(absoluteFilePath);
  }
  if (ocrSpace.isConfigured()) {
    return ocrSpace.recognizeText(absoluteFilePath);
  }
  const { data } = await Tesseract.recognize(absoluteFilePath, "eng");
  return data.text;
}

module.exports = { recognizeText };
