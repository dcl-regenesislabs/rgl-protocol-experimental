// protocol#412 — `scrollPosition` accepts an `elementId` string.
// Tag any descendant with `uiTransform.elementId`, then set the parent's
// `scrollPosition` to that id and the viewport snaps to that child.
// Ideal for "jump to section" UIs without computing pixel offsets.

const ScrollableSections = () => {
  const [target, setTarget] = useState<string | undefined>(undefined)

  // Trigger from a button or any event:
  //   setTarget('row-25')   →  viewport snaps to that child
  //   setTarget(undefined)  →  releases programmatic control

  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 300,
        overflow: 'scroll',
        scrollPosition: target,
        flexDirection: 'column'
      }}
    >
      <Label value="Row 0"  uiTransform={{ elementId: 'row-0',  width: '100%', height: 32 }} />
      <Label value="Row 25" uiTransform={{ elementId: 'row-25', width: '100%', height: 32 }} />
      <Label value="Row 50" uiTransform={{ elementId: 'row-50', width: '100%', height: 32 }} />
    </UiEntity>
  )
}
