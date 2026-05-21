// protocol#412 — `scrollVisible` controls which scroll bars are rendered.
// The container is still scrollable in 'hidden' mode (mouse wheel still
// works); the flag only governs the visual scrollbar chrome.
//   'vertical'   — only the vertical bar
//   'horizontal' — only the horizontal bar
//   'both'       — both bars
//   'hidden'     — no bars rendered

type ScrollVisible = 'vertical' | 'horizontal' | 'both' | 'hidden'

const ScrollableWithBars = (props: { mode: ScrollVisible }) => (
  <UiEntity
    uiTransform={{
      width: 400,
      height: 300,
      overflow: 'scroll',
      scrollVisible: props.mode,
      flexDirection: 'column'
    }}
  >
    {/* … long content … */}
  </UiEntity>
)
