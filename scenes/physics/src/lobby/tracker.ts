import { engine, Entity, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

export type SystemFn = (dt: number) => void

export type TestSceneHandle = {
  dispose: () => void
}

export type SceneTracker = {
  track: <E extends Entity>(entity: E) => E
  create: () => Entity
  system: (fn: SystemFn, priority?: number, name?: string) => SystemFn
  onDispose: (fn: () => void) => void
  run: <T>(setup: () => T) => T
  handle: TestSceneHandle
}

type Scope = {
  entities: Set<Entity>
  systems: SystemFn[]
  stageRoot: Entity | null
}

// Active scope. When non-null, every engine.addEntity()/addSystem() call made
// (anywhere in the runtime, including inside test systems) gets auto-tracked.
let activeScope: Scope | null = null

// Set by SceneManager before invoking a scene's loader. Causes the next
// createTracker() to spawn a stage-root entity at this position and parent
// every Transform.create call (without an explicit parent) to that root.
// Cleared after the loader returns.
let ambientStageOffset: Vector3 | null = null

export function setAmbientStageOffset(offset: Vector3 | null): void {
  ambientStageOffset = offset
}

// Capture originals before patching.
const _origAddEntity = engine.addEntity.bind(engine)
const _origAddSystem = engine.addSystem.bind(engine)
const _origTransformCreate = Transform.create.bind(Transform)

;(engine as any).addEntity = function (...args: any[]) {
  const e = _origAddEntity(...(args as []))
  if (activeScope) activeScope.entities.add(e)
  return e
}

;(engine as any).addSystem = function (fn: SystemFn, priority?: number, name?: string) {
  const captured = activeScope
  let wrapped: SystemFn = fn
  if (captured) {
    wrapped = (dt: number) => {
      const prev = activeScope
      activeScope = captured
      try { fn(dt) } finally { activeScope = prev }
    }
    captured.systems.push(wrapped)
  }
  return _origAddSystem(wrapped, priority, name)
}

// Patched Transform.create — when a scope is active AND it has a stageRoot,
// any Transform with no explicit parent gets reparented to the stage root.
// This translates the whole test's content to wherever the stage root is.
// Children with an explicit parent are unaffected, so nested hierarchies and
// AvatarAttach-style entities keep working.
;(Transform as any).create = function (entity: Entity, val?: any) {
  if (
    activeScope?.stageRoot &&
    entity !== activeScope.stageRoot &&
    (!val || val.parent === undefined)
  ) {
    return _origTransformCreate(entity, { ...(val || {}), parent: activeScope.stageRoot })
  }
  return _origTransformCreate(entity, val)
}

// Convenience: run a setup function in a fresh scope and return only the handle.
// The callback optionally receives the tracker (for onDispose, explicit create, etc.).
export function runScoped(setup: (t: SceneTracker) => void): TestSceneHandle {
  const tr = createTracker()
  tr.run(() => setup(tr))
  return tr.handle
}

export function createTracker(): SceneTracker {
  const scope: Scope = { entities: new Set(), systems: [], stageRoot: null }
  const teardowns: Array<() => void> = []

  // If the scene manager set an ambient offset, spawn a stage root entity
  // BEFORE entering the scope (so it isn't parented to itself). All subsequent
  // Transform.create calls inside the scope will reparent to it.
  if (ambientStageOffset) {
    const root = _origAddEntity()
    _origTransformCreate(root, { position: ambientStageOffset })
    scope.entities.add(root)
    scope.stageRoot = root
  }

  const handle: TestSceneHandle = {
    dispose: () => {
      for (const fn of teardowns) {
        try { fn() } catch (e) { console.error('[scene] teardown threw', e) }
      }
      for (const s of scope.systems) {
        try { engine.removeSystem(s) } catch { /* already removed */ }
      }
      for (const e of scope.entities) {
        try { engine.removeEntity(e) } catch { /* already removed */ }
      }
    }
  }

  function run<T>(setup: () => T): T {
    const prev = activeScope
    activeScope = scope
    try {
      return setup()
    } finally {
      activeScope = prev
    }
  }

  return {
    track<E extends Entity>(entity: E): E {
      scope.entities.add(entity)
      return entity
    },
    create(): Entity {
      const e = _origAddEntity()
      scope.entities.add(e)
      return e
    },
    system(fn: SystemFn, priority?: number, name?: string): SystemFn {
      const prev = activeScope
      activeScope = scope
      try {
        engine.addSystem(fn, priority, name)
      } finally {
        activeScope = prev
      }
      return fn
    },
    onDispose(fn: () => void) {
      teardowns.push(fn)
    },
    run,
    handle
  }
}
