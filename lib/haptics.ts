/** Light tap — button press */
export function hapticTap(): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return
  try {
    navigator.vibrate(12)
  } catch {
    /* unsupported */
  }
}

/** Success pattern — freeze / extend */
export function hapticSuccess(): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return
  try {
    navigator.vibrate([18, 40, 28])
  } catch {
    /* unsupported */
  }
}
