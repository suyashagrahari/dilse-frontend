"use client";

import { useMemo } from "react";
import {
  DEMO_DATA,
  indexScenes,
  progressDenominator,
  validateSceneGraph,
  type GraphReport,
  type Scene,
  type SceneIndex,
} from "./types";

export interface SceneGraph {
  /** The scenes actually safe to play. Demo scenes when the authored set fails. */
  scenes: Scene[];
  startSceneId: string;
  byId: SceneIndex;
  /** Denominator for the progress bar — the SHORTEST path, per the contract. */
  denom: number;
  /** Report for the AUTHORED graph, so the dev panel names the real problem. */
  report: GraphReport;
  /** True when we swapped the authored graph out for the demo one. */
  usedFallback: boolean;
}

/**
 * Validates the authored scene graph once and decides what the player is
 * allowed to run.
 *
 * This is wired before the player exists, on purpose. A branch that dead-ends
 * renders a blank screen with no error and is miserable to debug, so a bad
 * graph must fail loudly in development and fail SAFELY in production:
 *
 *   - development → keep the broken graph out of the player and render
 *     `report.errors` in a visible panel (see `DevErrorPanel`).
 *   - production  → silently fall back to the demo episode. A recipient should
 *     never be shown a developer's mistake, and never a white screen.
 *
 * Warnings (uneven branches, unreachable scenes, a finale carrying choices) are
 * NOT fatal — they surface in the panel but the authored graph still plays.
 */
export function useSceneGraph(scenes: Scene[], startSceneId: string): SceneGraph {
  return useMemo(() => {
    const report = validateSceneGraph(scenes, startSceneId);

    if (report.ok) {
      return {
        scenes,
        startSceneId,
        byId: indexScenes(scenes),
        denom: progressDenominator(report),
        report,
        usedFallback: false,
      };
    }

    // The authored graph is structurally broken. Play the demo episode instead
    // of walking into an unrenderable node.
    const demoReport = validateSceneGraph(DEMO_DATA.scenes, DEMO_DATA.startSceneId);
    return {
      scenes: DEMO_DATA.scenes,
      startSceneId: DEMO_DATA.startSceneId,
      byId: indexScenes(DEMO_DATA.scenes),
      denom: progressDenominator(demoReport),
      report,
      usedFallback: true,
    };
  }, [scenes, startSceneId]);
}
