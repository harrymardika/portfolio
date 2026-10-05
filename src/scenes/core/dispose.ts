import type { Material, Object3D, Texture } from 'three';

function isTexture(value: unknown): value is Texture {
  return typeof value === 'object' && value !== null && (value as Texture).isTexture === true;
}

function disposeMaterial(material: Material): void {
  for (const value of Object.values(material)) {
    if (isTexture(value)) value.dispose();
  }
  material.dispose();
}

/** Dispose geometries, materials, and their textures for an object tree. */
export function disposeObject3D(root: Object3D): void {
  root.traverse((node) => {
    const mesh = node as Object3D & { geometry?: { dispose(): void }; material?: Material | Material[] };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    materials.forEach(disposeMaterial);
  });
}
