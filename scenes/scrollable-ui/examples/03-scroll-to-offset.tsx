// protocol#412 — `scrollPosition` also accepts a `Vector2`, treated as a
// NORMALIZED offset in the 0..1 range (0 = top/left, 1 = bottom/right).
// Values outside that range are clamped by the renderer. Set the field to
// `undefined` to release programmatic control and let the user wheel-scroll.

type Offset = { x: number; y: number } | undefined

const ScrollByOffset = () => {
  const [target, setTarget] = useState<Offset>(undefined)

  // Trigger from a button or any event:
  //   setTarget({ x: 0, y: 0   })  →  snap to top
  //   setTarget({ x: 0, y: 0.5 })  →  snap to middle
  //   setTarget({ x: 0, y: 1   })  →  snap to bottom
  //   setTarget(undefined)         →  release control

  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 300,
        overflow: 'scroll',
        scrollPosition: target,
        flexDirection: 'column'
      }}
    />
  )
}
