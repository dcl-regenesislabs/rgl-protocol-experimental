// protocol#412 — `UiScrollResult` is the renderer → scene feedback channel.
// For every scrollable container, the renderer writes the current scroll
// offset (in pixels) back into this component. Read it from any ECS
// system to react to user-driven scroll changes — e.g., lazy-load rows,
// fire analytics, or sync external state.
import { engine, UiScrollResult } from '@dcl/sdk/ecs'

engine.addSystem(() => {
  for (const [entity, result] of engine.getEntitiesWith(UiScrollResult)) {
    if (!result.value) continue
    const { x, y } = result.value
    // Use (x, y) however you need — no per-frame allocation required.
    void entity
    void x
    void y
  }
})
