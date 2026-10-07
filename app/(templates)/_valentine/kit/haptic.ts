/**
 * A tiny vibration, as a bonus only. `navigator.vibrate` needs a user gesture,
 * is silently ignored in DND and does not exist at all on iOS Safari — so this
 * is a safe no-op everywhere it cannot run, and NO experience may depend on it:
 * every haptic moment must also have a visual beat.
 *
 *   haptic(15)            // a tick
 *   haptic([20, 80, 20])  // a heartbeat
 */
export function haptic(pattern: number | number[] = 12): void {
  try {
    if (typeof navigator === "undefined") return;
    const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    if (typeof nav.vibrate === "function") nav.vibrate(pattern);
  } catch {
    /* never throws */
  }
}
