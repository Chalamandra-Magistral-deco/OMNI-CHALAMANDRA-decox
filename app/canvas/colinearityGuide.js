/**
 * COLLINEARITY GUIDE — OMNI-CHALAMANDRA
 * Responsibility: Precision math for point alignment and geometric tension.
 */

/**
 * Analyzes how well points align on a single vector.
 * @param {Array} points - Array of {x, y} coordinates.
 * @returns {Object} Alignment metrics and system status.
 */
export function projectPointsToBaseline(points = []) {
  if (!Array.isArray(points) || points.length < 2) {
    throw new Error("Projection requires at least two points");
  }

  const first = points[0];
  const last = points[points.length - 1];

  const dx = last.x - first.x;
  const dy = last.y - first.y;
  const lengthSquared = dx * dx + dy * dy;

  if (!Number.isFinite(lengthSquared) || lengthSquared === 0) {
    throw new Error("Cannot project points onto a degenerate baseline");
  }

  return points.map((point) => {
    const t =
      ((point.x - first.x) * dx + (point.y - first.y) * dy) /
      lengthSquared;

    return {
      x: first.x + t * dx,
      y: first.y + t * dy
    };
  });
}

export function analyzeColinearity(points = []) {
  if (!Array.isArray(points) || points.length < 3) {
    return {
      alignmentScore: 0,
      tension: 0,
      deviationMap: [],
      status: "INSUFFICIENT_DATA"
    };
  }

  // Define the vector between the first and last point as the "ideal" line
  const baseline = computeBaseline(points[0], points[points.length - 1]);
  let totalDeviation = 0;

  const deviationMap = points.map((p) => {
    const deviation = distanceFromLine(p, baseline);
    totalDeviation += deviation;
    return Number(deviation.toFixed(2));
  });

  const avgDeviation = totalDeviation / points.length;
  const alignmentScore = Number(normalizeAlignment(avgDeviation).toFixed(4));
  const tension = computeTension(alignmentScore);

  return {
    alignmentScore, // 1.0 = Perfect line, 0.0 = Chaotic distribution
    tension,        // High tension means high geometric drift
    deviationMap,
    status: resolveStatus(alignmentScore)
  };
}

/* --------------------------------------------------
   INTERNAL MATH HELPERS
-------------------------------------------------- */

function computeBaseline(p1, p2) {
  return {
    p1,
    p2,
    dx: p2.x - p1.x,
    dy: p2.y - p1.y
  };
}

function distanceFromLine(point, baseline) {
  const { p1, p2, dx, dy } = baseline;
  // Point-to-line distance formula: |Ax + By + C| / sqrt(A^2 + B^2)
  const numerator = Math.abs(
    dy * point.x - dx * point.y + p2.x * p1.y - p2.y * p1.x
  );
  const denominator = Math.sqrt(dx * dx + dy * dy);

  return denominator === 0 ? 0 : numerator / denominator;
}

function normalizeAlignment(avgDeviation) {
  // Sensitivity: pixels of deviation before the score hits zero
  const sensitivity = 50;
  const score = 1 - Math.min(avgDeviation / sensitivity, 1);
  return Math.max(0, Math.min(1, score));
}

function computeTension(alignmentScore) {
  return Number((1 - alignmentScore).toFixed(4));
}

function resolveStatus(alignmentScore) {
  if (alignmentScore > 0.85) return "HIGH_ALIGNMENT";
  if (alignmentScore > 0.6) return "MODERATE_ALIGNMENT";
  if (alignmentScore > 0.3) return "LOW_ALIGNMENT";
  return "FRACTURED";
}
