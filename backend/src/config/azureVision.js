const fs = require("fs");

const ENDPOINT = process.env.AZURE_VISION_ENDPOINT; // e.g. https://your-resource.cognitiveservices.azure.com
const KEY = process.env.AZURE_VISION_KEY;

function isConfigured() {
  return Boolean(ENDPOINT && KEY);
}

/**
 * Runs Azure's Read API (handles both printed and handwritten text) on the
 * given image file and returns the extracted text as a single string.
 */
async function recognizeText(absoluteFilePath) {
  if (!isConfigured()) {
    throw new Error("Azure Vision is not configured (missing endpoint/key).");
  }

  const imageBuffer = fs.readFileSync(absoluteFilePath);
  const baseUrl = ENDPOINT.replace(/\/$/, "");

  // Step 1: submit the image for analysis.
  const submitResponse = await fetch(`${baseUrl}/vision/v3.2/read/analyze`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/octet-stream",
    },
    body: imageBuffer,
  });

  if (submitResponse.status !== 202) {
    const errText = await submitResponse.text();
    throw new Error(`Azure Vision submit failed (${submitResponse.status}): ${errText}`);
  }

  const operationLocation = submitResponse.headers.get("operation-location");
  if (!operationLocation) {
    throw new Error("Azure Vision did not return an operation-location header.");
  }

  // Step 2: poll until the analysis is done (typically 1-3 seconds).
  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const resultResponse = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": KEY },
    });
    const result = await resultResponse.json();

    if (result.status === "succeeded") {
      const lines = [];
      for (const page of result.analyzeResult?.readResults || []) {
        for (const line of page.lines || []) {
          lines.push(line.text);
        }
      }
      return lines.join("\n");
    }

    if (result.status === "failed") {
      throw new Error("Azure Vision analysis failed.");
    }
    // otherwise status is "running" or "notStarted" -- keep polling
  }

  throw new Error("Azure Vision analysis timed out.");
}

module.exports = { recognizeText, isConfigured };
