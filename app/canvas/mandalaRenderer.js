/**
 * MANDALA RENDERER — OMNI-CHALAMANDRA
 * Responsibility: Convert validated signals into drawable geometry structures.
 */

/**
 * Builds a geometric object from authoritative deterministic signals.
 * Gemini interpretation is not used as a source of visual parameters.
 */
export function buildMandalaGeometry({
  geometryType,
  frequencyHz,
  crossRatio,
  colinearity
}) {
  console.log(">> MANDALA: Building geometry construction...");

  // Normalization to keep the mandala within the viewport
  const baseRadius = normalizeFrequency(frequencyHz);
  const symmetry = resolveSymmetry(geometryType);
  const rotation = (crossRatio || 1.0) * Math.PI;

  const layers = [];

  for (let i = 0; i < symmetry; i++) {
    const angle = (2 * Math.PI / symmetry) * i + rotation;

    layers.push({
      id: `layer_${i}`, // Corrected Template Literal
      angle,
      // Tension expands the radius, alignmentScore defines the presence
      radius: baseRadius * (1 + (colinearity?.tension || 0)),
      opacity: resolveOpacity(colinearity?.alignmentScore || 1),
      weight: resolveWeight(crossRatio)
    });
  }

  return {
    type: geometryType,
    symmetry,
    frequency_hz: frequencyHz,
    base_radius: baseRadius,
    layers,
    render_hint: resolveRenderHint(geometryType)
  };
}

/* --------------------------------------------------
   INTERNAL HELPERS (PURE MATH / VISUAL)
-------------------------------------------------- */

function normalizeFrequency(freq) {
  // Visual mapping: converts Hz into a scale factor (30% to 100%)
  return Math.min(1.0, Math.max(0.3, freq / 1000));
}

function resolveSymmetry(geometryType) {
  // Balanced with invariant mapping
  switch (geometryType) {
    case "HARMONIC_GOLDEN":     return 8; 
    case "DEGENERATE_LINEAR":   return 2;
    case "PARADIGM_INVERSION":  return 4;
    case "DISRUPTIVE_EXPANSION": return 12;
    case "STANDARD":            return 6;
    default:                    return 6;
  }
}

function resolveOpacity(alignmentScore) {
  // High fracture = low opacity (loss of reality/stability)
  return Math.min(1, Math.max(0.2, alignmentScore));
}

function resolveWeight(crossRatio) {
  if (crossRatio > 1.5) return 2.5;
  if (crossRatio > 1.0) return 1.5;
  return 0.8;
}

function resolveRenderHint(geometryType) {
  switch (geometryType) {
    case "HARMONIC_EXPANSION": return "ROTATIONAL_FLOW";
    case "PARADIGM_INVERSION": return "NOISE_PERTURBATION";
    default:                   return "SYMMETRIC_STATIC";
  }
}

/**
 * RENDER MANDALA — Main entry point for canvas drawing.
 * @param {CanvasRenderingContext2D} ctx - The canvas context.
 * @param {Object} finalPayload - The full audited system payload.
 */
export function renderMandala(ctx, finalPayload) {
  const {
    authoritative_signals,
    input_analysis
  } = finalPayload;

  const geometry = buildMandalaGeometry({
    geometryType: authoritative_signals?.geometry_category,
    frequencyHz: authoritative_signals?.frequency_hz,
    crossRatio: authoritative_signals?.cross_ratio,
    colinearity: input_analysis?.colinearity
  });

  const { width, height } = ctx.canvas;
  const centerX = width / 2;
  const centerY = height / 2;

  // Initial feedback: Glow Effect
  ctx.shadowBlur = 15;
  ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--glow-color').trim() || "rgba(0, 243, 255, 0.5)";

  geometry.layers.forEach((layer, index) => {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(layer.angle);

    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || "#00f3ff";
    ctx.lineWidth = layer.weight;
    ctx.globalAlpha = layer.opacity;

    // Drawing a complex recursive petal shape
    const petalSize = layer.radius * 150;
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      petalSize / 2, -petalSize / 2,
      petalSize, -petalSize / 4,
      petalSize, 0
    );
    ctx.bezierCurveTo(
      petalSize, petalSize / 4,
      petalSize / 2, petalSize / 2,
      0, 0
    );

    ctx.stroke();

    // Secondary detail: Orbital nodes
    if (index % 2 === 0) {
      ctx.beginPath();
      ctx.arc(petalSize, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
    }

    ctx.restore();
  });

  // Reset shadow for subsequent draws
  ctx.shadowBlur = 0;
}
