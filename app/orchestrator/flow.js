/**
 * OMNI-CHALAMANDRA — Orchestrator Flow
 * Lead Developer: Dana Michelle Vargas
 * Brasdefer — Chalamandra Magistral
 * Project Initiative: DecoX
 */

import { runGeminiDebate } from "../agents/geminiAgent.js";
import { auditWithGeorge } from "../agents/GeorgeAgent.js";
import { calculateCrossRatio } from "../canvas/crossRatio.js";
import {
  analyzeColinearity,
  projectPointsToBaseline
} from "../canvas/colinearityGuide.js";
import { computeInvariantSignals } from "../config/invariantConfig.js";
import { validateContract } from "../utils/validate-contract.js";

export async function orchestrateOMNI(points) {
  console.log(">> OMNI: Initiating reasoning sequence...");

  // 1. Deterministic Geometric Analysis
  const colinearity = analyzeColinearity(points);

  // Human click input cannot be expected to be mathematically exact.
  // Accept sufficiently aligned input, then canonicalize it deterministically
  // before calculating the authoritative projective invariant.
  const MIN_INPUT_ALIGNMENT = 0.99;

  if (colinearity.alignmentScore < MIN_INPUT_ALIGNMENT) {
    throw new Error(
      `OMNI: four points are insufficiently aligned; alignment=${colinearity.alignmentScore}`
    );
  }

  const normalizedPoints = projectPointsToBaseline(points);
  const crossRatio = calculateCrossRatio(normalizedPoints);

  // The Invariant Engine is authoritative for derived signals.
  const signals = computeInvariantSignals(crossRatio);

  const inputPayload = {
    crossRatio,
    mandalaSeed: { points: [...points] },
    computedValues: {
      frequency_hz: signals.frequency_hz,
      coordination_index: signals.coordination_index,
      geometry_category: signals.geometry_category,
      colinearity_score: colinearity.alignmentScore
    },
    hashChain: {
      current: "0x" + Math.random().toString(16).slice(2),
      previous: "0xGENESIS",
      iteration: 1
    }
  };

  // 2. Generative Reasoning Layer (Gemini 3.8 Flash)
  const debate = await runGeminiDebate(inputPayload);

  // 3. Shadow Audit Layer (GEORGE)
  // We pass the debate results and the original math for verification
  const auditResults = await auditWithGeorge(debate, inputPayload);

  // 4. Return unified payload for UI and Renderers
  // This object structure is the "Source of Truth" for the entire app
  const finalPayload = {
    input_analysis: {
      cross_ratio: crossRatio,
      points: points,
      colinearity: colinearity
    },
    authoritative_signals: {
      cross_ratio: signals.cross_ratio,
      frequency_hz: signals.frequency_hz,
      coordination_index: signals.coordination_index,
      geometry_category: signals.geometry_category
    },
    debate: debate, // Gemini interpretation only
    george_verdict: auditResults.george_verdict,
    chain_data: {
      current_hash: inputPayload.hashChain.current,
      iteration: inputPayload.hashChain.iteration
    }
  };

  // 5. Contract Verification
  const validation = validateContract(finalPayload);
  if (!validation.valid) {
    console.error(">> OMNI: Contract Violation Detected!", validation.errors);
    // In a live demo, we might still return the payload but George will trigger Panic
    finalPayload.george_verdict.status = "CRITICAL";
    finalPayload.george_verdict.panic_triggered = true;
    finalPayload.george_verdict.final_verdict += " [CONTRACT_VIOLATION]";
  }

  return finalPayload;
}
