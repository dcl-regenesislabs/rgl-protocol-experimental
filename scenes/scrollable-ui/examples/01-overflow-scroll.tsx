// protocol#412 — overflow: 'scroll' turns a UiEntity into a scrollable
// viewport. When children exceed its bounds, the user can wheel-scroll
// inside it. No extra component is needed; the new UiTransform field
// does all the work.

const ScrollableList = () => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      overflow: 'scroll',
      flexDirection: 'column',
      padding: 8
    }}
    uiBackground={{ color: Color4.create(0.08, 0.1, 0.14, 1) }}
  >
    {Array.from({ length: 40 }, (_, i) => (
      <Label
        key={i}
        value={`Row ${i + 1}`}
        uiTransform={{ width: '100%', height: 32 }}
      />
    ))}
  </UiEntity>
)
