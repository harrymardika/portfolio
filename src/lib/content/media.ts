/**
 * Resolve image paths written in content files (relative to `content/`, e.g. `media/profile.jpg`)
 * to Astro image metadata, so they go through astro:assets optimization.
 * Uses Vite's import.meta.glob, so like ./queries it is not importable from unit tests.
 */
import type { ImageMetadata } from 'astro';

const IMAGES = import.meta.glob<{ default: ImageMetadata }>('/content/**/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
});

export function contentImage(path: string): ImageMetadata {
  const image = IMAGES[`/content/${path.replace(/^\/+/, '')}`];
  if (!image) {
    throw new Error(`Image "${path}" not found. Paths are relative to content/, e.g. "media/profile.jpg".`);
  }
  return image.default;
}
