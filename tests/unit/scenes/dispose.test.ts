import { describe, expect, it } from 'bun:test';
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Texture } from 'three';

import { disposeObject3D } from '@/scenes/core';

describe('disposeObject3D', () => {
  it('disposes geometries, materials, and material textures in the whole tree', () => {
    const disposed: string[] = [];
    const track = <T extends { dispose(): void }>(name: string, item: T): T => {
      const original = item.dispose.bind(item);
      item.dispose = () => {
        disposed.push(name);
        original();
      };
      return item;
    };

    const texture = track('texture', new Texture());
    const root = new Group();
    const child = new Mesh(
      track('box', new BoxGeometry()),
      track('basic', new MeshBasicMaterial({ map: texture })),
    );
    const multi = new Mesh(track('box2', new BoxGeometry()), [
      track('std1', new MeshStandardMaterial()),
      track('std2', new MeshStandardMaterial()),
    ]);
    root.add(child);
    child.add(multi);

    disposeObject3D(root);

    expect(disposed.sort()).toEqual(['basic', 'box', 'box2', 'std1', 'std2', 'texture']);
  });
});
