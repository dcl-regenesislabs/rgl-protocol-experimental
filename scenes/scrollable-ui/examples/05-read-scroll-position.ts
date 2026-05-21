// protocol#412 — `UiScrollResult` is the renderer → scene feedback channel.
// For every scrollable container, the renderer writes the current scroll
// offset back into this component as a NORMALIZED `Vector2` in the 0..1
// range (matching `scrollPosition`'s units). Read it from any ECS system
// to react to user-driven scroll — e.g., lazy-load rows, fire analytics,
// or sync external state.

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
