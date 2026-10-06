/**
 * EXPORT JSON — OMNI-CHALAMANDRA
 * Responsibility: Generate a downloadable audit trail of the reasoning process.
 */

/**
 * Creates and downloads a JSON file containing the full reasoning trace.
 * @param {Object} finalPayload - The complete result from the orchestrator.
 */
export function exportResultJSON(finalPayload) {
  // Destructuring to extract data, mapping george_verdict to shadow_audit logic
  const {
    debate,         // Gemini interpretation only
    authoritative_signals,
    george_verdict,
    input_analysis,
    chain_data
  } = finalPayload;

  const exportObject = {
    project: "OMNI-CHALAMANDRA",
    version: "3.5-PRO",
    execution_context: "gemini_3_hackathon",
    timestamp: new Date().toISOString(),

    geometry_input: {
      points: input_analysis?.points || [],
      cross_ratio: authoritative_signals?.cross_ratio ?? input_analysis?.cross_ratio,
      geometry_category: authoritative_signals?.geometry_category,
      colinearity: input_analysis?.colinearity || {}
    },

    mandala_seed: {
      points: input_analysis?.points || [],
      invariant_anchor: input_analysis?.cross_ratio || 1.0
    },

    cognitive_signals: {
      frequency_hz: authoritative_signals?.frequency_hz,
      coordination_index: authoritative_signals?.coordination_index,
      harmonic_resonance:
        authoritative_signals?.frequency_hz != null
          ? `${authoritative_signals.frequency_hz}Hz`
          : "N/A"
    },

    agent_debate: debate?.agent_insights || {},

    shadow_audit: {
      auditor: "GEORGE",
      status: george_verdict?.status || "UNKNOWN",
      panic_triggered: george_verdict?.panic_triggered || false,
      drift_score: george_verdict?.drift_score || 0,
      glitch_intensity: george_verdict?.glitch_intensity || 0,
      hallucination_score: george_verdict?.hallucination_score || 0,
      final_verdict: george_verdict?.final_verdict || "No audit performed"
    },

    chain_data: {
      current_hash: chain_data?.current || chain_data?.current_hash,
      iteration: chain_data?.iteration || 1
    }
  };

  try {
    const dataStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    // Corrected Template Literal
    link.download = `omni_audit_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(">> EXPORT: Audit report generated successfully.");
  } catch (error) {
    console.error(">> EXPORT ERROR: Failed to generate JSON file.", error);
  }

  return exportObject;
}
