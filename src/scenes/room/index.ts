/**
 * "One room" (ADR 0019): a single fixed canvas behind the page. Parts (hero prints, journey thread,
 * sorting line, notes, laptop) are anchored to HTML "slots" and scroll with them; their shadows fall
 * on a wall just behind the page plane. Mounted through `mountScene`, so capability checks, still
 * mode, resizing, and cleanup are shared with every other scene (docs/02-architecture.md §6).
 */
import {
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  Vector2,
  type Object3D,
  type WebGLRenderer,
} from 'three';

import { detectCapabilities, realtimeShadows } from '../core/capabilities';
import { damp } from '../core/math';
import { mountScene } from '../core/mount';
import { readPalette, type ScenePalette } from '../core/palette';
import { isNear, pageOffset, worldPerPixel, type PageRect } from './layout';

import type { FrameContext, SceneHandle, SceneModule, SceneSetup } from '../core/types';

/** Camera: distance from the page plane and vertical field of view (degrees). */
export const CAMERA = { distance: 12, fov: 30 } as const;
/** The wall that catches shadows sits this far behind the page plane (world units). */
export const WALL_DEPTH = 2.2;
/** Parts are built when their slot is this close to the viewport (CSS px). */
export const BUILD_MARGIN = 900;
/** Strongest pointer parallax, in world units of camera travel. */
const PARALLAX = { x: 0.35, y: 0.2 } as const;

export interface RoomContext {
  /** World units per CSS pixel on the page plane. */
  readonly wpp: number;
  readonly viewWidth: number;
  readonly viewHeight: number;
  readonly palette: ScenePalette;
  readonly mode: SceneSetup['mode'];
  /** Real-time shadows are on (capable devices only); parts draw soft blobs otherwise. */
  readonly shadows: boolean;
  readonly renderer: WebGLRenderer;
  /** Ask for another frame (still mode, async textures). */
  readonly invalidate: () => void;
}

export interface RoomFrame extends FrameContext {
  readonly room: RoomContext;
  /** Current scroll position (CSS px). */
  readonly scrollY: number;
}

export interface RoomTarget {
  readonly object: Object3D;
  /** What a click on the object does; it must have an HTML equivalent (ADR 0019). */
  readonly onClick?: () => void;
}

/** One piece of the room, anchored to an HTML element. */
export interface RoomPart {
  /** Element the part follows; also where its HTML fallback lives. */
  readonly slot: HTMLElement;
  /** Build the objects once, when the slot comes near. The returned root is added to the page group. */
  build(room: RoomContext): Object3D | Promise<Object3D>;
  /** Place the objects for the slot's current rectangle (document coordinates). */
  layout(room: RoomContext, rect: PageRect): void;
  /** Advance animations; return true while something still moves, so frames keep coming. */
  update?(frame: RoomFrame): boolean;
  /** The theme changed: apply the new token colors. */
  recolor?(palette: ScenePalette): void;
  /** Objects the pointer can click. */
  targets?(): readonly RoomTarget[];
  /** Free what `disposeObject3D` cannot reach (canvas textures are reached; timers, listeners are not). */
  dispose?(): void;
}

interface Entry {
  readonly part: RoomPart;
  root: Object3D | null;
  building: boolean;
}

/** Document rectangle of an element. */
export function pageRect(element: Element): PageRect {
  const box = element.getBoundingClientRect();
  return {
    left: box.left + window.scrollX,
    top: box.top + window.scrollY,
    width: box.width,
    height: box.height,
  };
}

/** Elements whose clicks belong to the HTML, never to the room behind it. */
const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="dialog"], [popover]';

/** `create` for `mountScene`. */
export function createRoom(parts: readonly RoomPart[], shadows: boolean) {
  return (setup: SceneSetup): SceneModule => {
    const { renderer } = setup;
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = PCFSoftShadowMap;

    const scene = new Scene();
    const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 200);
    camera.position.set(0, 0, CAMERA.distance);

    // Everything anchored to the page lives in this group; scrolling only moves the group.
    const page = new Group();
    scene.add(page);

    const sky = new HemisphereLight(0xffffff, 0x8899aa, 0.5);
    const sun = new DirectionalLight(0xfff4e0, 1.15);
    sun.position.set(-6, 7, 9);
    sun.castShadow = shadows;
    const mapSize = window.innerWidth < 768 ? 1024 : 2048;
    sun.shadow.mapSize.set(mapSize, mapSize);
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sky, sun, sun.target);

    const wallMaterial = new ShadowMaterial({ opacity: 0.38 });
    const wall = new Mesh(new PlaneGeometry(1, 1), wallMaterial);
    wall.receiveShadow = true;
    wall.position.z = -WALL_DEPTH;
    scene.add(wall);

    let palette = setup.palette;
    let view = { width: window.innerWidth, height: window.innerHeight };
    let wpp = worldPerPixel(view.height, CAMERA.distance, CAMERA.fov);
    let scrollY = window.scrollY;
    let dirty = true;
    let animating = false;
    let pointerMoved = false;
    let readySignalled = false;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const pointerPx = new Vector2(-1, -1);
    const entries: Entry[] = parts.map((part) => ({ part, root: null, building: false }));

    const request = (): void => {
      dirty = true;
      setup.invalidate();
    };
    const context = (): RoomContext => ({
      wpp,
      viewWidth: view.width,
      viewHeight: view.height,
      palette,
      mode: setup.mode,
      shadows,
      renderer,
      invalidate: request,
    });

    const layout = (entry: Entry): void => {
      if (entry.root) entry.part.layout(context(), pageRect(entry.part.slot));
    };

    const buildNear = (): void => {
      for (const entry of entries) {
        if (entry.root || entry.building) continue;
        if (!isNear(pageRect(entry.part.slot), scrollY, view.height, BUILD_MARGIN)) continue;
        entry.building = true;
        void Promise.resolve()
          .then(() => entry.part.build(context()))
          .then((root) => {
            entry.root = root;
            page.add(root);
            entry.part.recolor?.(palette);
            layout(entry);
            if (!readySignalled) {
              readySignalled = true;
              setup.ready();
            }
            request();
          })
          .catch((error: unknown) => console.warn('3D: a room part failed to build', error));
      }
    };

    const fitWall = (): void => {
      // The wall fills the view at its depth, with room for the pointer parallax.
      const height = 2 * (CAMERA.distance + WALL_DEPTH) * Math.tan((CAMERA.fov * Math.PI) / 360);
      wall.scale.set(height * (view.width / view.height) * 1.3, height * 1.3, 1);
      // The shadow camera covers what is on screen (plus a margin), since the light never moves.
      const reach = Math.max(view.width, view.height) * wpp * 0.75;
      Object.assign(sun.shadow.camera, {
        left: -reach,
        right: reach,
        top: reach,
        bottom: -reach,
        near: 1,
        far: 40,
      });
      sun.shadow.camera.updateProjectionMatrix();
    };

    const onScroll = (): void => {
      scrollY = window.scrollY;
      buildNear();
      request();
    };
    const onPointer = (event: PointerEvent): void => {
      pointer.tx = (event.clientX / view.width) * 2 - 1;
      pointer.ty = (event.clientY / view.height) * 2 - 1;
      pointerPx.set(event.clientX, event.clientY);
      pointerMoved = true;
      if (setup.mode === 'animated') request();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Clicks on room objects that have an HTML twin (journey dots, project cards).
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const targetAt = (clientX: number, clientY: number): RoomTarget | null => {
      const targets = entries.flatMap((entry) => (entry.root ? (entry.part.targets?.() ?? []) : []));
      if (targets.length === 0) return null;
      ndc.set((clientX / view.width) * 2 - 1, -(clientY / view.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(
        targets.map((target) => target.object),
        true,
      )[0];
      if (!hit) return null;
      return (
        targets.find((target) => {
          for (let node: Object3D | null = hit.object; node; node = node.parent) {
            if (node === target.object) return true;
          }
          return false;
        }) ?? null
      );
    };
    const onClick = (event: MouseEvent): void => {
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
      targetAt(event.clientX, event.clientY)?.onClick?.();
    };
    window.addEventListener('click', onClick);

    // Theme changes: re-read the token colors (explicit choice or OS setting).
    const recolor = (): void => {
      palette = readPalette();
      wallMaterial.color.setHex(palette['room-shadow']);
      for (const entry of entries) if (entry.root) entry.part.recolor?.(palette);
      request();
    };
    const themeObserver = new MutationObserver(recolor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', recolor);
    wallMaterial.color.setHex(palette['room-shadow']);

    // Layout changes (fonts, images, text wrapping): re-anchor every part.
    const relayout = new ResizeObserver(() => {
      for (const entry of entries) layout(entry);
      buildNear();
      request();
    });
    relayout.observe(document.body);

    buildNear();

    return {
      scene,
      camera,
      update(frame) {
        const room = context();
        page.position.y = pageOffset(scrollY, view.height, wpp);
        if (setup.mode === 'animated') {
          pointer.x = damp(pointer.x, pointer.tx, 4, frame.dt);
          pointer.y = damp(pointer.y, pointer.ty, 4, frame.dt);
        }
        camera.position.set(pointer.x * PARALLAX.x, -pointer.y * PARALLAX.y, CAMERA.distance);
        camera.lookAt(0, 0, 0);
        animating = Math.abs(pointer.tx - pointer.x) > 0.002 || Math.abs(pointer.ty - pointer.y) > 0.002;
        for (const entry of entries) {
          if (entry.root && entry.part.update?.({ ...frame, room, scrollY })) animating = true;
        }
        if (pointerMoved) {
          pointerMoved = false;
          document.documentElement.classList.toggle(
            'room-hover',
            targetAt(pointerPx.x, pointerPx.y) !== null,
          );
        }
      },
      needsRender() {
        const render = dirty || animating;
        dirty = false;
        return render;
      },
      resize(width, height) {
        view = { width, height };
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        wpp = worldPerPixel(height, CAMERA.distance, CAMERA.fov);
        fitWall();
        for (const entry of entries) layout(entry);
        buildNear();
        dirty = true;
      },
      dispose() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('click', onClick);
        themeObserver.disconnect();
        darkQuery.removeEventListener('change', recolor);
        relayout.disconnect();
        for (const entry of entries) entry.part.dispose?.();
        document.documentElement.classList.remove('room-hover');
      },
    };
  };
}

/**
 * Mount the room on its fixed stage (RoomStage.astro). Returns null when the 3D stays off; every
 * part's HTML fallback then simply stays visible.
 */
export function mountRoom(stage: HTMLElement, parts: readonly RoomPart[]): SceneHandle | null {
  const canvas = stage.querySelector('canvas');
  if (!canvas || parts.length === 0) return null;
  return mountScene({ stage, canvas, create: createRoom(parts, realtimeShadows(detectCapabilities())) });
}

export type { PageRect } from './layout';
