/**
 * OMNI-CHALAMANDRA — INVARIANT ENGINE
 *
 * Deterministic mathematical grounding layer.
 *
 * This module is authoritative for derived signals.
 * Generative models must not redefine these values.
 */

export function computeInvariantSignals(crossRatio) {
  if (
    typeof crossRatio !== "number" ||
    !Number.isFinite(crossRatio)
  ) {
    throw new Error("Invariant Engine: crossRatio must be finite");
  }

  let geometry_category;

  if (crossRatio < 0) {
    geometry_category = "CHAOTIC";
  } else if (crossRatio < 0.5) {
    geometry_category = "UNSTABLE";
  } else if (crossRatio < 1.5) {
    geometry_category = "BALANCED";
  } else {
    geometry_category = "HIGHLY_ORDERED";
  }

  const coordination_index = Math.max(
    0,
    Math.min(1, 1 - Math.abs(crossRatio - 1))
  );

  const frequency_hz = Math.round(
    220 + coordination_index * 440
  );

  return {
    cross_ratio: crossRatio,
    geometry_category,
    coordination_index: Number(
      coordination_index.toFixed(3)
    ),
    frequency_hz
  };
}
