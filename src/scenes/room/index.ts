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
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  Vector2,
  Vector3,
  type Object3D,
  type WebGLRenderer,
} from 'three';

import { decide3D, detectCapabilities, realtimeShadows } from '../core/capabilities';
import { disposeObject3D } from '../core/dispose';
import { damp } from '../core/math';
import { mountScene } from '../core/mount';
import { readPalette, type ScenePalette } from '../core/palette';
import { isNear, pageOffset, worldPerPixel, type PageRect } from './layout';

import type { FrameContext, SceneHandle, SceneModule, SceneSetup } from '../core/types';

/** Camera: distance from the page plane and vertical field of view (degrees). */
export const CAMERA = { distance: 12, fov: 30 } as const;
/** The wall that catches shadows sits this far behind the page plane (world units). */
export const WALL_DEPTH = 0.7;
/** Parts are built when their slot is this close to the viewport (CSS px). */
export const BUILD_MARGIN = 900;
/** A press that moves farther than this (CSS px) is a drag or a text selection, not a click. */
const CLICK_SLOP = 5;

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
  /** Viewport position (CSS px) of a world point, as currently drawn. */
  readonly toScreen: (world: Vector3) => { x: number; y: number };
}

/**
 * Per-frame input for parts. `pointer` is the room's own pointer over the whole window (-1..1),
 * damped; the stage itself never receives pointer events. The object is reused between frames.
 */
export interface RoomFrame extends FrameContext {
  readonly room: RoomContext;
  /** Current scroll position (CSS px). */
  readonly scrollY: number;
}

export interface RoomTarget {
  readonly object: Object3D;
  /**
   * What a click on the object does; it must have an HTML equivalent (ADR 0019). `pointerType` is
   * that of the press ('mouse', 'touch', 'pen'), so a tap can preview before it navigates.
   */
  readonly onClick?: (event: MouseEvent, pointerType: string) => void;
  /** The mouse moved onto (true) or off (false) the object. */
  readonly onHover?: (hovered: boolean) => void;
}

/**
 * One piece of the room, anchored to an HTML element. `layout` runs on resize and whenever the
 * document body changes size; a slot that moves without that (transforms, sticky) is not followed.
 */
export interface RoomPart {
  /** Element the part follows; also where its HTML fallback lives. */
  readonly slot: HTMLElement;
  /** Build the objects once, when the slot comes near. The returned root is added to the page group. */
  build(room: RoomContext): Object3D | Promise<Object3D>;
  /** Place the objects for the slot's current rectangle (document coordinates). */
  layout(room: RoomContext, rect: PageRect): void;
  /** Advance animations; return true while something still moves, so frames keep coming. */
  update?(frame: RoomFrame): boolean;
  /** The root was added to the scene and will be drawn from the next frame on. */
  shown?(): void;
  /** The theme changed: apply the new token colors. */
  recolor?(palette: ScenePalette): void;
  /**
   * Objects the pointer can click. Read again after every build, layout, and recolor, so a part may
   * replace its objects in either.
   */
  targets?(): readonly RoomTarget[];
  /**
   * Free what `disposeObject3D` cannot reach (listeners, timers, DOM state). Called on destroy for
   * every part, built or not.
   */
  dispose?(): void;
}

interface Entry {
  readonly part: RoomPart;
  root: Object3D | null;
  building: boolean;
}

/**
 * Document rectangle of an element, vertically. Horizontal page scroll is not tracked (the site
 * never scrolls sideways), so `left` stays in viewport coordinates, like the camera.
 */
export function pageRect(element: Element): PageRect {
  const box = element.getBoundingClientRect();
  return { left: box.left, top: box.top + window.scrollY, width: box.width, height: box.height };
}

/** Elements whose clicks belong to the HTML, never to the room behind it. */
const INTERACTIVE = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  'dialog',
  'iframe',
  'video',
  '[role="dialog"]',
  '[role="button"]',
  '[role="link"]',
  '[popover]',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** `create` for `mountScene`. */
export function createRoom(parts: readonly RoomPart[], shadows: boolean) {
  return (setup: SceneSetup): SceneModule => {
    const { renderer } = setup;
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = PCFShadowMap;

    const scene = new Scene();
    const camera = new PerspectiveCamera(CAMERA.fov, 1, 0.1, 200);
    camera.position.set(0, 0, CAMERA.distance);

    // Everything anchored to the page lives in this group; scrolling only moves the group.
    const page = new Group();
    scene.add(page);

    let palette = setup.palette;
    const sky = new HemisphereLight(palette['room-sky'], palette['room-ground'], 2.3);
    const sun = new DirectionalLight(palette['room-sun'], 1.8);
    sun.position.set(-4, 5, 10);
    sun.castShadow = shadows;
    const mapSize = window.innerWidth < 768 ? 1024 : 2048;
    sun.shadow.mapSize.set(mapSize, mapSize);
    sun.shadow.radius = 3;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sky, sun, sun.target);

    // Without a shadow map the wall would only cost fill rate, so it is drawn only with shadows.
    const wallMaterial = new ShadowMaterial({ opacity: 0.3 });
    const wall = new Mesh(new PlaneGeometry(1, 1), wallMaterial);
    wall.receiveShadow = true;
    wall.visible = shadows;
    wall.position.z = -WALL_DEPTH;
    scene.add(wall);

    let view = { width: window.innerWidth, height: window.innerHeight };
    let wpp = worldPerPixel(view.height, CAMERA.distance, CAMERA.fov);
    let scrollY = window.scrollY;
    let dirty = true;
    let animating = false;
    let hoverPending = false;
    let readySignalled = false;
    let disposed = false;
    let targets: RoomTarget[] = [];
    let hovered: RoomTarget | null = null;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const pointerPx = new Vector2(-1, -1);
    const entries: Entry[] = parts.map((part) => ({ part, root: null, building: false }));

    const request = (): void => {
      dirty = true;
      setup.invalidate();
    };
    const projected = new Vector3();
    const toScreen = (world: Vector3): { x: number; y: number } => {
      scene.updateMatrixWorld();
      projected.copy(world).project(camera);
      return { x: ((projected.x + 1) / 2) * view.width, y: ((1 - projected.y) / 2) * view.height };
    };
    const makeContext = (): RoomContext => ({
      wpp,
      viewWidth: view.width,
      viewHeight: view.height,
      palette,
      mode: setup.mode,
      shadows,
      renderer,
      invalidate: request,
      toScreen,
    });
    // Rebuilt only when its inputs change (resize, theme), not every frame.
    let room = makeContext();
    const frame = { dt: 0, elapsed: 0, pointer: { x: 0, y: 0 }, room, scrollY };

    const applyLights = (): void => {
      sky.color.setHex(palette['room-sky']);
      sky.groundColor.setHex(palette['room-ground']);
      sun.color.setHex(palette['room-sun']);
      wallMaterial.color.setHex(palette['room-shadow']);
    };
    applyLights();

    const layout = (entry: Entry): void => {
      if (entry.root) entry.part.layout(room, pageRect(entry.part.slot));
    };

    const collectTargets = (): void => {
      targets = entries.flatMap((entry) => (entry.root ? [...(entry.part.targets?.() ?? [])] : []));
      if (hovered && !targets.includes(hovered)) {
        hovered.onHover?.(false);
        hovered = null;
      }
    };

    const buildNear = (): void => {
      for (const entry of entries) {
        if (entry.root || entry.building) continue;
        if (!isNear(pageRect(entry.part.slot), scrollY, view.height, BUILD_MARGIN)) continue;
        entry.building = true;
        void Promise.resolve()
          .then(() => entry.part.build(room))
          .then(async (root) => {
            if (disposed) {
              disposeObject3D(root);
              entry.part.dispose?.();
              return;
            }
            entry.part.recolor?.(palette);
            entry.root = root;
            layout(entry);
            // Compile the part's shaders without blocking the page, before its first frame.
            await renderer.compileAsync(root, camera, scene).catch(() => undefined);
            if (disposed) {
              disposeObject3D(root);
              entry.part.dispose?.();
              return;
            }
            page.add(root);
            entry.part.shown?.();
            collectTargets();
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

    // Clicks and hover on room objects that have an HTML twin (journey dots, project cards).
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const targetAt = (clientX: number, clientY: number): RoomTarget | null => {
      if (targets.length === 0) return null;
      scene.updateMatrixWorld();
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
    const updateHover = (): void => {
      const next = targetAt(pointerPx.x, pointerPx.y);
      document.documentElement.classList.toggle('room-hover', next !== null);
      if (next === hovered) return;
      hovered?.onHover?.(false);
      next?.onHover?.(true);
      hovered = next;
    };

    const onScroll = (): void => {
      scrollY = window.scrollY;
      buildNear();
      if (pointerPx.x >= 0) hoverPending = true;
      request();
    };
    const onPointer = (event: PointerEvent): void => {
      pointer.tx = (event.clientX / view.width) * 2 - 1;
      pointer.ty = (event.clientY / view.height) * 2 - 1;
      // Hover only means something for a mouse; touch taps would leave the cursor class stuck.
      if (event.pointerType !== 'mouse') return;
      pointerPx.set(event.clientX, event.clientY);
      if (setup.mode === 'animated') {
        hoverPending = true;
        request();
      } else {
        updateHover();
      }
    };
    let press: { x: number; y: number; type: string } | null = null;
    const onPointerDown = (event: PointerEvent): void => {
      press = { x: event.clientX, y: event.clientY, type: event.pointerType };
    };
    const onClick = (event: MouseEvent): void => {
      if (event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
      // A drag, or a click that ends a text selection, is not meant for the room.
      if (press && Math.hypot(event.clientX - press.x, event.clientY - press.y) > CLICK_SLOP) return;
      if (!(window.getSelection()?.isCollapsed ?? true)) return;
      targetAt(event.clientX, event.clientY)?.onClick?.(event, press?.type ?? 'mouse');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('click', onClick);

    // Theme changes: re-read the token colors (explicit choice or OS setting).
    const recolor = (): void => {
      palette = readPalette();
      room = makeContext();
      applyLights();
      for (const entry of entries) if (entry.root) entry.part.recolor?.(palette);
      collectTargets();
      request();
    };
    const themeObserver = new MutationObserver(recolor);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkQuery.addEventListener('change', recolor);

    // Layout changes (fonts, images, text wrapping): re-anchor every part.
    const relayout = new ResizeObserver(() => {
      for (const entry of entries) layout(entry);
      collectTargets();
      buildNear();
      request();
    });
    relayout.observe(document.body);

    buildNear();

    return {
      scene,
      camera,
      update(input) {
        page.position.y = pageOffset(scrollY, view.height, wpp);
        if (setup.mode === 'animated') {
          pointer.x = damp(pointer.x, pointer.tx, 4, input.dt);
          pointer.y = damp(pointer.y, pointer.ty, 4, input.dt);
        }
        // The camera never moves: objects on the page plane must stay exactly over their HTML twins
        // (clicks, alignment). Parts tilt themselves with the pointer instead.
        animating = Math.abs(pointer.tx - pointer.x) > 0.002 || Math.abs(pointer.ty - pointer.y) > 0.002;
        Object.assign(frame, { dt: input.dt, elapsed: input.elapsed, room, scrollY });
        frame.pointer.x = pointer.x;
        frame.pointer.y = pointer.y;
        let moving = false;
        for (const entry of entries) {
          if (entry.root && entry.part.update?.(frame)) moving = true;
        }
        if (moving) animating = true;
        // Objects that move by themselves (the sorting line) can slide under or away from a still mouse.
        if (moving && pointerPx.x >= 0) hoverPending = true;
        if (hoverPending) {
          hoverPending = false;
          updateHover();
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
        room = makeContext();
        fitWall();
        for (const entry of entries) layout(entry);
        collectTargets();
        buildNear();
        dirty = true;
      },
      dispose() {
        disposed = true;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('pointermove', onPointer);
        window.removeEventListener('pointerdown', onPointerDown);
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
 * part's HTML fallback then simply stays visible. Probes the device once.
 */
export function mountRoom(stage: HTMLElement, parts: readonly RoomPart[]): SceneHandle | null {
  const canvas = stage.querySelector('canvas');
  if (!canvas || parts.length === 0) return null;
  const caps = detectCapabilities();
  return mountScene({
    stage,
    canvas,
    decision: decide3D(caps),
    create: createRoom(parts, realtimeShadows(caps)),
  });
}

export type { PageRect } from './layout';
