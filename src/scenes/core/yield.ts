/**
 * Give the main thread back to the browser between two pieces of heavy work (building the room,
 * uploading textures), so input and painting never wait behind one long task. Uses
 * `scheduler.yield()` where the browser has it, otherwise a zero-delay timeout.
 */
export function yieldToMain(): Promise<void> {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (typeof scheduler?.yield === 'function') return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
