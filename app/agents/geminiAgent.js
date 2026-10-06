/**
 * OMNI-CHALAMANDRA — GEMINI CLIENT ADAPTER
 *
 * Browser responsibility:
 *   Send an OMNI payload to the server boundary.
 *
 * Gemini credentials and provider logic remain server-side.
 */

export async function runGeminiDebate(input) {
  const response = await fetch("/api/omni", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    throw new Error("OMNI API returned invalid JSON");
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
      `OMNI API request failed: ${response.status}`
    );
  }

  return data;
}
