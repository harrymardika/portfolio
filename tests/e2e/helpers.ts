/**
 * Shared e2e settings. Headless Chromium renders WebGL on the CPU (SwiftShader), so 3D scenes can
 * take a while to become ready when the whole suite runs in parallel; real visitors use a GPU.
 */
export const SCENE_READY_TIMEOUT = 30_000;
