/**
 * CROSS RATIO (R) — OMNI-CHALAMANDRA
 *
 * Responsibility:
 * Compute the projective cross-ratio of four collinear points.
 *
 * Authority rule:
 * - Points must be collinear.
 * - The calculation preserves orientation/sign.
 * - Non-collinear input is rejected instead of producing a
 *   mathematically misleading projective invariant.
 */

/**
 * Computes the oriented cross-ratio of four collinear points A, B, C, D.
 *
 * Formula:
 *
 *   R = ((A-C) / (B-C)) / ((A-D) / (B-D))
 *
 * For arbitrary 2D collinear points, the coordinates are projected
 * onto the dominant axis so orientation is preserved.
 *
 * @param {Array<{x:number,y:number}>} points
 * @returns {number}
 */
export function calculateCrossRatio(points) {
  if (!Array.isArray(points) || points.length < 4) {
    throw new Error("Cross-ratio requires four points");
  }

  const [A, B, C, D] = points;

  if (![A, B, C, D].every(isFinitePoint)) {
    throw new Error("Cross-ratio requires four finite 2D points");
  }

  if (!areCollinear(A, B, C, D)) {
    throw new Error("Cross-ratio requires four collinear points");
  }

  const axis = dominantAxis(A, B, C, D);

  const a = A[axis];
  const b = B[axis];
  const c = C[axis];
  const d = D[axis];

  const denominator = (b - c) * (a - d);

  if (denominator === 0) {
    throw new Error("Cross-ratio singularity detected");
  }

  const ratio = ((a - c) * (b - d)) / denominator;

  if (!Number.isFinite(ratio)) {
    throw new Error("Cross-ratio produced a non-finite result");
  }

  console.log(`>> MATH: Oriented cross-ratio R: ${ratio.toFixed(6)}`);

  return Number(ratio.toFixed(6));
}

/**
 * Categorizes the ratio for downstream logic.
 */
export function categorizeCrossRatio(R) {
  if (!Number.isFinite(R)) return "INVALID";
  if (R < 0) return "PARADIGM_INVERSION";
  if (R < 0.618) return "COLLAPSE_RISK";
  if (R < 1.0) return "STABLE_COMPRESSION";
  if (Math.abs(R - 1.618) < 0.1) return "HARMONIC_GOLDEN";
  if (R < 2.0) return "HARMONIC_EXPANSION";
  return "DISRUPTIVE_EXPANSION";
}

function isFinitePoint(point) {
  return (
    point &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y)
  );
}

function dominantAxis(A, B, C, D) {
  const dx = Math.max(
    Math.abs(A.x - B.x),
    Math.abs(A.x - C.x),
    Math.abs(A.x - D.x)
  );

  const dy = Math.max(
    Math.abs(A.y - B.y),
    Math.abs(A.y - C.y),
    Math.abs(A.y - D.y)
  );

  return dx >= dy ? "x" : "y";
}

function areCollinear(A, B, C, D) {
  const area = (B.x - A.x) * (C.y - A.y)
             - (B.y - A.y) * (C.x - A.x);

  const area2 = (B.x - A.x) * (D.y - A.y)
              - (B.y - A.y) * (D.x - A.x);

  const scale = Math.max(
    1,
    Math.abs(B.x - A.x),
    Math.abs(B.y - A.y),
    Math.abs(C.x - A.x),
    Math.abs(C.y - A.y),
    Math.abs(D.x - A.x),
    Math.abs(D.y - A.y)
  );

  const tolerance = 1e-9 * scale * scale;

  return Math.abs(area) <= tolerance &&
         Math.abs(area2) <= tolerance;
}
