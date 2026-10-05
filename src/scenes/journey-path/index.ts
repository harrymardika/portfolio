/**
 * Journey path (docs/03-design-system.md §5): a tube through one node per milestone and a glowing
 * orb that follows scroll progress. Milestone labels stay HTML; this scene only reports where each
 * node lands on screen (onProject) so the page can place the labels next to them.
 */
import {
  CatmullRomCurve3,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from 'three';

import { isReached, pathPlacement, pathPoints } from './layout';
import { damp } from '@/scenes/core/math';

import type { SceneModule, SceneSetup } from '@/scenes/core/types';

export interface ProjectedNode {
  /** Position in CSS pixels relative to the stage's top-left corner. */
  readonly x: number;
  readonly y: number;
  readonly reached: boolean;
}

export interface JourneyPathOptions {
  readonly count: number;
  /** Scroll progress 0..1, read every frame. */
  readonly getProgress: () => number;
  /** Receives node screen positions after every frame. */
  readonly onProject: (nodes: readonly ProjectedNode[]) => void;
}

const CAMERA = { fov: 40, distance: 9 } as const;
const MOTION = { followRate: 3, tiltY: 0.18, tiltX: 0.08, ringSpin: 0.8, orbRate: 6 } as const;

export function createJourneyPath(setup: SceneSetup, options: JourneyPathOptions): SceneModule {
  const { palette } = setup;
  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
  camera.position.set(0, 0.6, CAMERA.distance);
  camera.lookAt(0, 0, 0);

  scene.add(new HemisphereLight(palette['on-forest'], palette.sage, 2));
  const sun = new DirectionalLight(palette['on-forest'], 2);
  sun.position.set(3, 5, 6);
  scene.add(sun);

  const group = new Group();
  scene.add(group);

  const points = pathPoints(options.count).map((p) => new Vector3(p.x, p.y, p.z));
  const curve = points.length > 1 ? new CatmullRomCurve3(points, false, 'catmullrom', 0.5) : null;
  if (curve) {
    group.add(
      new Mesh(
        new TubeGeometry(curve, 200, 0.07, 12, false),
        new MeshStandardMaterial({ color: palette.forest, roughness: 0.45 }),
      ),
    );
  }

  const nodeMaterial = new MeshStandardMaterial({
    color: palette.amber,
    emissive: palette.amber,
    emissiveIntensity: 0.15,
    roughness: 0.35,
  });
  const ringMaterial = new MeshStandardMaterial({ color: palette.forest, roughness: 0.4 });
  const nodes = points.map((point) => {
    const node = new Mesh(new SphereGeometry(0.22, 32, 24), nodeMaterial);
    node.position.copy(point);
    const ring = new Mesh(new TorusGeometry(0.34, 0.035, 12, 48), ringMaterial);
    ring.position.copy(point);
    group.add(node, ring);
    return { node, ring };
  });

  const orb = new Mesh(
    new SphereGeometry(0.2, 32, 24),
    new MeshStandardMaterial({ color: palette.amber, emissive: palette.amber, emissiveIntensity: 0.9 }),
  );
  const glow = new PointLight(palette.amber, 1.5, 2.5);
  group.add(orb, glow);

  let width = 1;
  let height = 1;
  let orbProgress = setup.mode === 'still' ? 1 : 0;
  const projected = new Vector3();
  let announced = false;

  function project(progress: number): void {
    scene.updateMatrixWorld();
    options.onProject(
      nodes.map(({ node }, index) => {
        node.getWorldPosition(projected).project(camera);
        return {
          x: (projected.x * 0.5 + 0.5) * width,
          y: (-projected.y * 0.5 + 0.5) * height,
          reached: isReached(index, nodes.length, progress),
        };
      }),
    );
  }

  return {
    scene,
    camera,
    update({ dt, elapsed, pointer }) {
      // Reduced motion: the whole path is shown as completed, without movement.
      const target = setup.mode === 'still' ? 1 : options.getProgress();
      orbProgress = setup.mode === 'still' ? 1 : damp(orbProgress, target, MOTION.orbRate, dt);
      if (curve) curve.getPointAt(Math.min(1, Math.max(0, orbProgress)), orb.position);
      glow.position.copy(orb.position);

      group.rotation.y = damp(group.rotation.y, pointer.x * MOTION.tiltY, MOTION.followRate, dt);
      group.rotation.x = damp(group.rotation.x, pointer.y * MOTION.tiltX, MOTION.followRate, dt);
      nodes.forEach(({ ring }, index) => {
        ring.rotation.y = elapsed * MOTION.ringSpin;
        ring.scale.setScalar(isReached(index, nodes.length, orbProgress) ? 1 : 0.7);
      });
      // Labels follow the scroll position directly; only the orb eases toward it.
      project(target);
      // Labels have positions now, so the page can switch from the list to the 3D layout.
      if (!announced) {
        announced = true;
        setup.ready();
      }
    },
    resize(w, h) {
      width = w;
      height = h;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      const placement = pathPlacement(aspect);
      group.position.x = placement.x;
      group.scale.setScalar(placement.scale);
    },
  };
}
