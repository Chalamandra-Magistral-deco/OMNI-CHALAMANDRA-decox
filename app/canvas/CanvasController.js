/**
 * OMNI-CHALAMANDRA — CANVAS CONTROLLER
 * Lead Developer: Dana Michelle Vargas
 * Brasdefer — Chalamandra Magistral
 * Project Initiative: DecoX
 *
 * Responsibility: Receive final payload and execute the visual render pipeline.
 */

import { renderMandala } from "./mandalaRenderer.js";

export function CanvasController(finalPayload) {
  console.log(">> CANVAS: Initializing render pipeline...");

  /* --------------------------------------------------
     1. SAFETY CHECK — GEORGE AUTHORITY
  -------------------------------------------------- */
  // Sincronizado con la estructura de GEORGE (george_verdict)
  const audit = finalPayload?.george_verdict;

  if (!audit) {
    console.error("Canvas blocked: Shadow audit missing.");
    return { status: "ABORTED", reason: "Audit missing" };
  }

  if (audit.panic_triggered === true) {
    console.warn(">> CANVAS: Panic triggered. Rendering glitch state.");
    // El GlitchEngine se encarga del visual, aquí abortamos el render limpio
    return {
      status: "PANIC",
      reason: audit.final_verdict || audit.reason
    };
  }

  /* --------------------------------------------------
     2. EXTRACT CORE SIGNALS
  -------------------------------------------------- */
  const {
    input_analysis,
    authoritative_signals,
    chain_data
  } = finalPayload;

  const crossRatio = authoritative_signals?.cross_ratio ?? input_analysis?.cross_ratio;
  const frequencyHz = authoritative_signals?.frequency_hz;
  const geometryType = authoritative_signals?.geometry_category;

  /* --------------------------------------------------
     3. GEOMETRIC PRE-PROCESSING
  -------------------------------------------------- */
  // We use the colinearity data already processed by the orchestrator
  const colinearityData = input_analysis?.colinearity || {};

  /* --------------------------------------------------
     4. EXECUTE RENDERING
  -------------------------------------------------- */
  try {
    // Obtenemos el contexto del canvas del DOM
    const canvas = document.getElementById("main-canvas");
    const ctx = canvas.getContext("2d");

    // Renderizamos el Mandala usando los datos auditados
    renderMandala(ctx, finalPayload);

    console.log(`>> CANVAS: Render successful. Mode: ${geometryType}`);

    return {
      status: "SUCCESS",
      render_mode: "STABILIZED",
      visual_parameters: {
        geometry: geometryType,
        frequency_hz: frequencyHz,
        tension: colinearityData.tension
      },
      metadata: {
        hash: chain_data?.current_hash || "0x0",
        timestamp: Date.now()
      }
    };

  } catch (error) {
    console.error(">> CANVAS RENDER ERROR:", error);
    return { status: "ERROR", message: error.message };
  }
}
