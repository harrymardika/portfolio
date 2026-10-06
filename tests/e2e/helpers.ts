/**
 * Shared e2e settings. Headless Chromium renders WebGL on the CPU (SwiftShader), so 3D scenes can
 * take a while to become ready when the whole suite runs in parallel; real visitors use a GPU.
 */
import type { Page } from '@playwright/test';

export const SCENE_READY_TIMEOUT = 30_000;

/**
 * Software WebGL gets a still frame (src/scenes/core/capabilities.ts), so tests of the animated
 * scenes force the mode the way a developer would: localStorage['3d:mode'].
 */
export async function force3DMode(page: Page, mode: 'animated' | 'still' | 'off'): Promise<void> {
  await page.addInitScript((value) => localStorage.setItem('3d:mode', value), mode);
}
