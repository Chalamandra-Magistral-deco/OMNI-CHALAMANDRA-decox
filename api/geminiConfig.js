/**
 * OMNI-CHALAMANDRA — SERVER GEMINI CONFIG
 *
 * Single source of truth for Gemini model selection and response schema.
 * Gemini provides interpretation only.
 *
 * Authoritative mathematical signals and George's audit verdict
 * are produced outside the model response.
 */

export const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

export const GEMINI_MAX_OUTPUT_TOKENS = 4096;

export const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    agent_insights: {
      type: "object",
      properties: {
        scientist: { type: "string" },
        philosopher: { type: "string" },
        psychologist: { type: "string" },
        historian: { type: "string" },
        futurist: { type: "string" }
      },
      required: [
        "scientist",
        "philosopher",
        "psychologist",
        "historian",
        "futurist"
      ]
    }
  },
  required: [
    "agent_insights"
  ]
};
