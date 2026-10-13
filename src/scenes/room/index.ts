/**
 * "One room" (ADR 0019, 0020): a single fixed canvas behind the page. The parts (hero prints, journey
 * thread, sorting line, notes, laptop) stand at fixed stations in the room (./world.ts): a wall
 * behind the hero and the journey, a floor in front of it. The camera (./camera.ts) travels from
 * station to station as the page scrolls, keyed to the page's sections; the light follows the
 * camera's target and the wall colors follow its place on the jade → indigo path. Mounted through
 * `mountScene`, so capability checks, still mode, resizing, and cleanup are shared with every other
 * scene (docs/02-architecture.md §6).
 */
import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Texture,
  type Material,
  Scene,
  ShadowMaterial,
  Vector2,
  Vector3,
  type Object3D,
  type WebGLRenderer,
} from 'three';

import { decide3D, detectCapabilities, realtimeShadows, type Decision3D } from '../core/capabilities';
import { disposeObject3D } from '../core/dispose';
import { damp } from '../core/math';
import { mountScene } from '../core/mount';
import { yieldToMain } from '../core/yield';
import { readPalette, type ScenePalette } from '../core/palette';
import {
  flowAt,
  FOV,
  isWide,
  keyPosition,
  poseAt,
  stopsFor,
  trackAt,
  wallColors,
  WIDE_QUERY,
  type Sections,
  type Stop,
} from './camera';
import { isNear, type PageRect } from './layout';
import { FLOOR, FLOOR_Y, WALL, WALL_Z } from './world';

import type { FrameContext, SceneHandle, SceneModule, SceneSetup } from '../core/types';

/** Where the sun stands relative to the camera's target, and how far its shadows reach around it. */
const SUN = { offset: new Vector3(-6, 7, 8), reach: 12 } as const;
/** How far the sun follows a fine pointer (world units at the pointer's edge), animated mode only. */
const SUN_FOLLOW = { x: 2.4, y: 1.2 } as const;
/** Full intensity of the sky and the sun; `RoomContext.setLight` scales both. */
const LIGHT = { sky: 2.3, sun: 1.8 } as const;
/** Pointer parallax of the camera (world units), animated mode only. */
const PARALLAX = { x: 0.25, y: 0.15 } as const;
/** Parts are built when their slot is this close to the viewport (CSS px). */
export const BUILD_MARGIN = 900;
/** A press that moves farther than this (CSS px) is a drag or a text selection, not a click. */
const CLICK_SLOP = 5;

export interface RoomContext {
  readonly viewWidth: number;
  readonly viewHeight: number;
  /** Wide screen: the copy sits in a left column (camera.ts `WIDE_MIN`). */
  readonly wide: boolean;
  readonly palette: ScenePalette;
  readonly mode: SceneSetup['mode'];
  /** Real-time shadows are on (capable devices only); parts draw soft blobs otherwise. */
  readonly shadows: boolean;
  readonly renderer: WebGLRenderer;
  /** Ask for another frame (still mode, async textures). */
  readonly invalidate: () => void;
  /** Viewport position (CSS px) of a world point, as currently drawn. */
  readonly toScreen: (world: Vector3) => { x: number; y: number };
  /** Scale the room's light, 0 (dark) to 1 (full): the hero's lamp switching on (T14.2). */
  readonly setLight: (level: number) => void;
}

/**
 * Per-frame input for parts. `pointer` is the room's own pointer over the whole window (-1..1),
 * damped; the stage itself never receives pointer events. The object is reused between frames.
 */
export interface RoomFrame extends FrameContext {
  readonly room: RoomContext;
  /** Current scroll position (CSS px). */
  readonly scrollY: number;
  /**
   * Where the camera is along its keys in page order (0 = hero, 1 = journey start, 2 = journey end,
   * 3 = projects, 4 = messages, 5 = contact), continuous; parts can follow it.
   */
  readonly keys: number;
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
 * One piece of the room, standing at its station (./world.ts). Its HTML slot holds its data and its
 * fallback, and decides when it is built (when the slot comes near the viewport).
 */
export interface RoomPart {
  /** Element that holds the part's data and HTML fallback. */
  readonly slot: HTMLElement;
  /** Build the objects once, when the slot comes near. The returned root is added to the scene, in world units. */
  build(room: RoomContext): Object3D | Promise<Object3D>;
  /** The screen changed (size, wide or narrow): adjust. Runs after build and on every resize. */
  layout?(room: RoomContext): void;
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

/** The home page's sections, by `data-room-section`, in document coordinates. */
function readSections(): Sections {
  const sections: Record<string, { top: number; height: number }> = {};
  for (const element of document.querySelectorAll<HTMLElement>('[data-room-section]')) {
    const name = element.dataset['roomSection'];
    if (!name) continue;
    const rect = pageRect(element);
    sections[name] = { top: rect.top, height: rect.height };
  }
  return sections;
}

/** `create` for `mountScene`. */
export function createRoom(parts: readonly RoomPart[], shadows: boolean) {
  return (setup: SceneSetup): SceneModule => {
    const { renderer } = setup;
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = PCFShadowMap;

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 200);

    let palette = setup.palette;
    const sky = new HemisphereLight(palette['room-sky'], palette['room-ground'], LIGHT.sky);
    const sun = new DirectionalLight(palette['room-sun'], LIGHT.sun);
    const setLight = (level: number): void => {
      const k = Math.min(1, Math.max(0, level));
      sky.intensity = LIGHT.sky * k;
      sun.intensity = LIGHT.sun * k;
      dirty = true;
    };
    sun.castShadow = shadows;
    const mapSize = window.innerWidth < 768 ? 1024 : 2048;
    sun.shadow.mapSize.set(mapSize, mapSize);
    sun.shadow.radius = 3;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    // The shadow camera covers the area around the camera's target; the sun travels with it.
    Object.assign(sun.shadow.camera, {
      left: -SUN.reach,
      right: SUN.reach,
      top: SUN.reach,
      bottom: -SUN.reach,
      near: 0.5,
      far: 60,
    });
    sun.shadow.camera.updateProjectionMatrix();
    scene.add(sky, sun, sun.target);

    // The wall (hero, journey) and the floor (projects, notes, laptop) only catch shadows; the page's
    // own background is the room's color. Without a shadow map they would only cost fill rate.
    const shadowMaterial = new ShadowMaterial({ opacity: 0.3 });
    const wall = new Mesh(new PlaneGeometry(WALL.width, WALL.height), shadowMaterial);
    wall.position.set(0, FLOOR_Y + WALL.height / 2, WALL_Z);
    const floor = new Mesh(new PlaneGeometry(FLOOR.width, FLOOR.depth), shadowMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_Y, WALL_Z + FLOOR.depth / 2);
    for (const surface of [wall, floor]) {
      surface.receiveShadow = true;
      surface.visible = shadows;
      scene.add(surface);
    }

    // The wide layout as the CSS sees it: the canvas is narrower by the scrollbar.
    const wideQuery = window.matchMedia(WIDE_QUERY);
    let view = { width: window.innerWidth, height: window.innerHeight, wide: wideQuery.matches };
    let scrollY = window.scrollY;
    let stops: Stop[] = [];
    let dirty = true;
    let animating = false;
    let hoverPending = false;
    let readySignalled = false;
    let disposed = false;
    let targets: RoomTarget[] = [];
    let hovered: RoomTarget | null = null;
    let flow = -1;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    // The sun follows a mouse or a pen only (a finger tapping would make the light jump), also on a
    // touch laptop: its own pointer, moved by those alone.
    const sunPointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const pointerPx = new Vector2(-1, -1);
    const entries: Entry[] = parts.map((part) => ({ part, root: null, building: false }));
    const body = document.body;

    const request = (): void => {
      dirty = true;
      setup.invalidate();
    };
    const projected = new Vector3();
    const toScreen = (world: Vector3): { x: number; y: number } => {
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      projected.copy(world).project(camera);
      return { x: ((projected.x + 1) / 2) * view.width, y: ((1 - projected.y) / 2) * view.height };
    };
    const makeContext = (): RoomContext => ({
      viewWidth: view.width,
      viewHeight: view.height,
      wide: isWide(view),
      palette,
      mode: setup.mode,
      shadows,
      renderer,
      invalidate: request,
      toScreen,
      setLight,
    });
    // Rebuilt only when its inputs change (resize, theme), not every frame.
    let room = makeContext();
    const frame = { dt: 0, elapsed: 0, pointer: { x: 0, y: 0 }, room, scrollY, keys: 0 };

    const applyLights = (): void => {
      sky.color.setHex(palette['room-sky']);
      sky.groundColor.setHex(palette['room-ground']);
      sun.color.setHex(palette['room-sun']);
      shadowMaterial.color.setHex(palette['room-shadow']);
    };
    applyLights();

    const measure = (): void => {
      stops = stopsFor(readSections(), view.height, document.documentElement.scrollHeight - view.height);
    };

    // The camera: where the scroll position falls between the keys, plus a little pointer parallax.
    const target = new Vector3();
    const placeCamera = (): void => {
      // With reduced motion the camera never flies: it cuts from one room's view to the next.
      const travel = trackAt(scrollY, stops);
      const track = setup.mode === 'still' ? { ...travel, local: travel.local < 0.5 ? 0 : 1 } : travel;
      const pose = poseAt(track, stops, view);
      target.set(pose.target.x, pose.target.y, pose.target.z);
      camera.position.set(
        pose.position.x + pointer.x * PARALLAX.x,
        pose.position.y - pointer.y * PARALLAX.y,
        pose.position.z,
      );
      camera.lookAt(target);
      camera.setViewOffset(
        view.width,
        view.height,
        pose.offset.x * view.width,
        pose.offset.y * view.height,
        view.width,
        view.height,
      );
      sun.position.copy(target).add(SUN.offset);
      // The light drifts a little toward the cursor, as if someone moved the lamp.
      if (setup.mode === 'animated') {
        sun.position.x += sunPointer.x * SUN_FOLLOW.x;
        sun.position.y -= sunPointer.y * SUN_FOLLOW.y;
      }
      sun.target.position.copy(target);
      frame.keys = keyPosition(track, stops);
      // The walls follow the camera from jade to indigo, in steps (a style change repaints the page).
      const next = flowAt(track, stops);
      if (next !== flow) {
        flow = next;
        const colors = wallColors(flow);
        body.style.setProperty('--room-a', colors.a);
        body.style.setProperty('--room-b', colors.b);
        body.style.setProperty('--room-c', colors.c);
      }
    };

    const layout = (entry: Entry): void => {
      if (entry.root) entry.part.layout?.(room);
    };

    const collectTargets = (): void => {
      targets = entries.flatMap((entry) => (entry.root ? [...(entry.part.targets?.() ?? [])] : []));
      if (hovered && !targets.includes(hovered)) {
        hovered.onHover?.(false);
        hovered = null;
      }
    };

    /** Upload a part's textures one at a time, so no single frame carries all of them. */
    const uploadTextures = async (root: Object3D): Promise<void> => {
      const textures = new Set<Texture>();
      root.traverse((node) => {
        const material = (node as Mesh).material as Material | Material[] | undefined;
        for (const one of [material ?? []].flat()) {
          for (const value of Object.values(one)) if (value instanceof Texture) textures.add(value);
        }
      });
      for (const texture of textures) {
        renderer.initTexture(texture);
        await yieldToMain();
      }
    };

    // Parts are built one at a time, each step in its own task: building, compiling its shaders,
    // and uploading its textures, so the page stays responsive while the room comes in.
    let queue: Promise<void> = Promise.resolve();
    const build = async (entry: Entry): Promise<void> => {
      await yieldToMain();
      const root = await entry.part.build(room);
      const drop = (): void => {
        disposeObject3D(root);
        entry.part.dispose?.();
      };
      if (disposed) return drop();
      entry.part.recolor?.(palette);
      entry.root = root;
      layout(entry);
      await yieldToMain();
      // Compile the part's shaders without blocking the page, before its first frame.
      await renderer.compileAsync(root, camera, scene).catch(() => undefined);
      await uploadTextures(root);
      if (disposed) return drop();
      scene.add(root);
      entry.part.shown?.();
      collectTargets();
      if (!readySignalled) {
        readySignalled = true;
        setup.ready();
      }
      request();
    };
    const buildNear = (): void => {
      for (const entry of entries) {
        if (entry.root || entry.building) continue;
        if (!isNear(pageRect(entry.part.slot), scrollY, view.height, BUILD_MARGIN)) continue;
        entry.building = true;
        queue = queue
          .then(() => build(entry))
          .catch((error: unknown) => console.warn('3D: a room part failed to build', error));
      }
    };

    // Clicks and hover on room objects that have an HTML twin (journey dots, project cards).
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const targetAt = (clientX: number, clientY: number): RoomTarget | null => {
      if (targets.length === 0) return null;
      scene.updateMatrixWorld();
      camera.updateMatrixWorld();
      ndc.set((clientX / view.width) * 2 - 1, -(clientY / view.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      // The raycaster ignores visibility: skip objects hidden themselves or through a parent (a part
      // that shows only near its room).
      const shown = (object: Object3D): boolean => {
        for (let node: Object3D | null = object; node; node = node.parent) if (!node.visible) return false;
        return true;
      };
      const hit = raycaster
        .intersectObjects(
          targets.map((target) => target.object),
          true,
        )
        .find((intersection) => shown(intersection.object));
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
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        sunPointer.tx = pointer.tx;
        sunPointer.ty = pointer.ty;
      }
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

    // Layout changes (fonts, images, text wrapping): the sections, and so the camera's stops, move.
    const relayout = new ResizeObserver(() => {
      measure();
      buildNear();
      request();
    });
    relayout.observe(body);

    measure();
    buildNear();

    return {
      scene,
      camera,
      update(input) {
        if (setup.mode === 'animated') {
          pointer.x = damp(pointer.x, pointer.tx, 4, input.dt);
          pointer.y = damp(pointer.y, pointer.ty, 4, input.dt);
          sunPointer.x = damp(sunPointer.x, sunPointer.tx, 2, input.dt);
          sunPointer.y = damp(sunPointer.y, sunPointer.ty, 2, input.dt);
        }
        animating =
          Math.abs(pointer.tx - pointer.x) > 0.002 ||
          Math.abs(pointer.ty - pointer.y) > 0.002 ||
          Math.abs(sunPointer.tx - sunPointer.x) > 0.002 ||
          Math.abs(sunPointer.ty - sunPointer.y) > 0.002;
        placeCamera();
        Object.assign(frame, { dt: input.dt, elapsed: input.elapsed, room, scrollY });
        frame.pointer.x = pointer.x;
        frame.pointer.y = pointer.y;
        let moving = false;
        for (const entry of entries) {
          if (entry.root && entry.part.update?.(frame)) moving = true;
        }
        if (moving) animating = true;
        // The camera or objects that move by themselves (the sorting line) can slide under or away
        // from a still mouse.
        if ((moving || animating) && pointerPx.x >= 0) hoverPending = true;
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
        view = { width, height, wide: wideQuery.matches };
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        room = makeContext();
        measure();
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
        for (const name of ['--room-a', '--room-b', '--room-c']) body.style.removeProperty(name);
        document.documentElement.classList.remove('room-hover');
      },
    };
  };
}

/**
 * Mount the room on its fixed stage (RoomStage.astro). Returns null when the 3D stays off; every
 * part's HTML fallback then simply stays visible. With a `decision` already taken (the home page's
 * early decision, ADR 0020) WebGL is not probed again; otherwise the device is probed once.
 */
export function mountRoom(
  stage: HTMLElement,
  parts: readonly RoomPart[],
  decision?: Decision3D,
): SceneHandle | null {
  const canvas = stage.querySelector('canvas');
  if (!canvas || parts.length === 0) return null;
  let choice = decision;
  let device: Parameters<typeof realtimeShadows>[0];
  if (choice) {
    device = {
      hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    };
  } else {
    const caps = detectCapabilities();
    choice = decide3D(caps);
    device = caps;
  }
  return mountScene({ stage, canvas, decision: choice, create: createRoom(parts, realtimeShadows(device)) });
}

export type { PageRect } from './layout';
