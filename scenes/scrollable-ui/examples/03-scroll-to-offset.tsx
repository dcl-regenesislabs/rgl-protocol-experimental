// protocol#412 — `scrollPosition` also accepts a `Vector2`, treated as a
// pixel offset from the viewport's top-left corner. Set it to `undefined`
// to release programmatic control and let the user wheel-scroll freely.

type Offset = { x: number; y: number } | undefined

const ScrollByOffset = () => {
  const [target, setTarget] = useState<Offset>(undefined)

  // Trigger from a button or any event:
  //   setTarget({ x: 0, y: 0 })    →  snap to top
  //   setTarget({ x: 0, y: 300 })  →  scroll 300px down
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
