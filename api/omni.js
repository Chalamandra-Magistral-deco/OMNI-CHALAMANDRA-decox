/**
 * OMNI-CHALAMANDRA — SERVER AI BOUNDARY
 */

import { SYSTEM_PROMPT } from "../app/config/configPrompt.js";
import {
  GEMINI_MODEL,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_RESPONSE_SCHEMA
} from "./geminiConfig.js";

const MAX_BODY_BYTES = 64 * 1024;

// Función helper adaptada para Node.js/Vercel
function sendJson(response, data, status = 200) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(data));
}

function generateMockDebate(input) {
  const R = input.crossRatio;
  const vals = input.computedValues || {};
  return {
    agent_insights: {
      scientist: `The deterministic invariant R=${R} indicates a ${vals.geometry_category || "NEUTRAL"} geometric state.`,
      philosopher: "The invariant provides a structural anchor; interpretation remains subordinate to the computed geometry.",
      psychologist: `The ${vals.geometry_category || "NEUTRAL"} configuration can be interpreted through the system's coordination state.`,
      historian: "The measured geometric relation provides the contextual anchor for comparing structural patterns.",
      futurist: `The computed coordination index is ${vals.coordination_index ?? 0.5}; interpretation must preserve that external value.`
    }
  };
}

function validateInput(input) {
  if (!input || typeof input !== "object") return "Input must be an object";
  if (typeof input.crossRatio !== "number" || !Number.isFinite(input.crossRatio)) return "crossRatio must be a finite number";
  if (!input.computedValues || typeof input.computedValues !== "object") return "computedValues is required";
  return null;
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return sendJson(response, { error: "Method not allowed" }, 405);
  }

  const contentLength = Number(request.headers?.["content-length"] ?? request.headers?.["Content-Length"] ?? 0);

  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(response, { error: "Request body too large" }, 413);
  }

  let input;
  try {
    const body = request.body;
    if (Buffer.isBuffer(body)) {
      input = JSON.parse(body.toString("utf8"));
    } else if (typeof body === "string") {
      input = JSON.parse(body);
    } else {
      input = body || {};
    }
  } catch {
    return sendJson(response, { error: "Invalid JSON body" }, 400);
  }

  const validationError = validateInput(input);
  if (validationError) {
    return sendJson(response, { error: validationError }, 400);
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return sendJson(response, {
      mode: "mock",
      model: GEMINI_MODEL,
      ...generateMockDebate(input)
    });
  }

  const promptText = SYSTEM_PROMPT(input.crossRatio, input.computedValues, input.mandalaSeed, input.hashChain);

  const requestBody = {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_LOW_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
    ]
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await geminiResponse.json().catch(() => ({}));

    if (!geminiResponse.ok) {
      const message = data?.error?.message || geminiResponse.statusText || "Gemini request failed";
      return sendJson(response, { error: "Gemini API error", detail: message }, geminiResponse.status >= 500 ? 502 : 400);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return sendJson(response, { error: "Malformed Gemini response" }, 502);
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return sendJson(response, { error: "Gemini returned invalid JSON" }, 502);
    }

    return sendJson(response, {
      mode: "live",
      model: GEMINI_MODEL,
      ...result
    });
  } catch (error) {
    console.error("OMNI Gemini boundary error:", error);
    return sendJson(response, { error: "Gemini request failed" }, 502);
  }
}
