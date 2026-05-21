import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

const { useState } = ReactEcs

const ITEMS = Array.from({ length: 40 }, (_, i) => ({
  id: `item-${i}`,
  label: `Section ${i + 1}`
}))

const SCROLL_MODES = ['vertical', 'horizontal', 'both', 'hidden'] as const
type ScrollMode = (typeof SCROLL_MODES)[number]

type ScrollTarget = string | { x: number; y: number } | undefined

type SourceExample = { title: string; image: string }

const SOURCE_EXAMPLES: SourceExample[] = [
  {
    title: '1. overflow: scroll — basic scrollable container',
    image: 'assets/examples/01-overflow-scroll.png'
  },
  {
    title: '2. scrollPosition: elementId — jump-to-section',
    image: 'assets/examples/02-scroll-to-element.png'
  },
  {
    title: '3. scrollPosition: Vector2 — pixel offset',
    image: 'assets/examples/03-scroll-to-offset.png'
  },
  {
    title: '4. scrollVisible — vertical / horizontal / both / hidden',
    image: 'assets/examples/04-scroll-visible.png'
  },
  {
    title: '5. UiScrollResult — read user-driven scroll back',
    image: 'assets/examples/05-read-scroll-position.png'
  }
]

export const userScroll = { x: 0, y: 0 }

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(DemoUi)
}

const DemoUi = () => {
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget>(undefined)
  const [scrollMode, setScrollMode] = useState<ScrollMode>('vertical')
  const [sourceIndex, setSourceIndex] = useState<number | undefined>(undefined)

  const cycleMode = () => {
    const i = SCROLL_MODES.indexOf(scrollMode)
    setScrollMode(SCROLL_MODES[(i + 1) % SCROLL_MODES.length])
  }

  const openSource = () => setSourceIndex(0)
  const closeSource = () => setSourceIndex(undefined)
  const nextSource = () =>
    setSourceIndex(((sourceIndex ?? 0) + 1) % SOURCE_EXAMPLES.length)
  const prevSource = () =>
    setSourceIndex(
      ((sourceIndex ?? 0) - 1 + SOURCE_EXAMPLES.length) % SOURCE_EXAMPLES.length
    )

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {sourceIndex !== undefined ? (
        <SourceViewer
          index={sourceIndex}
          onClose={closeSource}
          onPrev={prevSource}
          onNext={nextSource}
        />
      ) : (
        <DemoPanel
          scrollTarget={scrollTarget}
          setScrollTarget={setScrollTarget}
          scrollMode={scrollMode}
          cycleMode={cycleMode}
          openSource={openSource}
        />
      )}
    </UiEntity>
  )
}

const DemoPanel = (props: {
  scrollTarget: ScrollTarget
  setScrollTarget: (t: ScrollTarget) => void
  scrollMode: ScrollMode
  cycleMode: () => void
  openSource: () => void
}) => {
  const { scrollTarget, setScrollTarget, scrollMode, cycleMode, openSource } = props

  return (
    <UiEntity
      uiTransform={{
        width: 560,
        height: 620,
        flexDirection: 'column',
        padding: 16
      }}
      uiBackground={{ color: Color4.create(0.04, 0.06, 0.1, 0.94) }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 32,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Label
          value="Scrollable UI Demo"
          fontSize={22}
          color={Color4.fromHexString('#7cffb2ff')}
          uiTransform={{ width: 280, height: 30 }}
        />
        <Button
          value="</> View source"
          variant="primary"
          fontSize={11}
          uiTransform={{ width: 130, height: 26 }}
          onMouseDown={openSource}
        />
      </UiEntity>
      <Label
        value="protocol#412 — overflow=scroll, scrollVisible, elementId, scrollPosition, UiScrollResult"
        fontSize={11}
        color={Color4.fromHexString('#888888ff')}
        uiTransform={{ width: '100%', height: 18, margin: '0 0 8 0' }}
      />

      <UiEntity
        uiTransform={{ width: '100%', height: 32, flexDirection: 'row', margin: '0 0 6 0' }}
      >
        <Button
          value="Top (ref)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 84, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setScrollTarget('item-0')}
        />
        <Button
          value="Middle (ref)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 96, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setScrollTarget('item-20')}
        />
        <Button
          value="Bottom (ref)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 96, height: 28 }}
          onMouseDown={() => setScrollTarget('item-39')}
        />
      </UiEntity>

      <UiEntity
        uiTransform={{ width: '100%', height: 32, flexDirection: 'row', margin: '0 0 6 0' }}
      >
        <Button
          value="y=0 (Vector2)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 110, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setScrollTarget({ x: 0, y: 0 })}
        />
        <Button
          value="y=300 (Vector2)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 122, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setScrollTarget({ x: 0, y: 300 })}
        />
        <Button
          value="Release"
          variant="primary"
          fontSize={11}
          uiTransform={{ width: 86, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setScrollTarget(undefined)}
        />
        <Button
          value={`bars: ${scrollMode}`}
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 124, height: 28 }}
          onMouseDown={cycleMode}
        />
      </UiEntity>

      <Label
        value={`UiScrollResult → { x: ${userScroll.x.toFixed(0)}, y: ${userScroll.y.toFixed(0)} }`}
        fontSize={11}
        color={Color4.fromHexString('#7cffb2ff')}
        uiTransform={{ width: '100%', height: 18, margin: '0 0 6 0' }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          flexGrow: 1,
          overflow: 'scroll',
          scrollVisible: scrollMode,
          scrollPosition: scrollTarget,
          flexDirection: 'column',
          padding: 8
        }}
        uiBackground={{ color: Color4.create(0.08, 0.1, 0.14, 1) }}
      >
        {ITEMS.map((it, i) => (
          <UiEntity
            key={it.id}
            uiTransform={{
              elementId: it.id,
              width: '100%',
              height: 38,
              flexDirection: 'row',
              alignItems: 'center',
              padding: '0 10',
              margin: '0 0 4 0'
            }}
            uiBackground={{
              color:
                i % 2 === 0
                  ? Color4.create(0.14, 0.18, 0.26, 1)
                  : Color4.create(0.1, 0.14, 0.2, 1)
            }}
          >
            <Label
              value={it.label}
              fontSize={13}
              color={Color4.White()}
              uiTransform={{ width: '100%', height: 22 }}
            />
          </UiEntity>
        ))}
      </UiEntity>
    </UiEntity>
  )
}

const SourceViewer = (props: {
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) => {
  const { index, onClose, onPrev, onNext } = props
  const example = SOURCE_EXAMPLES[index]

  return (
    <UiEntity
      uiTransform={{
        width: 900,
        height: 680,
        flexDirection: 'column',
        padding: 16
      }}
      uiBackground={{ color: Color4.create(0.04, 0.06, 0.1, 0.97) }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 34,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 0 8 0'
        }}
      >
        <Label
          value={example.title}
          fontSize={16}
          color={Color4.fromHexString('#7cffb2ff')}
          uiTransform={{ width: 700, height: 26 }}
        />
        <Button
          value="✕ Close"
          variant="primary"
          fontSize={12}
          uiTransform={{ width: 90, height: 28 }}
          onMouseDown={onClose}
        />
      </UiEntity>

      <UiEntity
        uiTransform={{
          width: '100%',
          flexGrow: 1,
          flexDirection: 'column'
        }}
        uiBackground={{
          texture: { src: example.image },
          textureMode: 'stretch'
        }}
      />

      <UiEntity
        uiTransform={{
          width: '100%',
          height: 36,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '8 0 0 0'
        }}
      >
        <Button
          value="← Prev"
          variant="secondary"
          fontSize={12}
          uiTransform={{ width: 90, height: 30 }}
          onMouseDown={onPrev}
        />
        <Label
          value={`${index + 1} / ${SOURCE_EXAMPLES.length}`}
          fontSize={12}
          color={Color4.fromHexString('#aaaaaaff')}
          uiTransform={{ width: 80, height: 24 }}
        />
        <Button
          value="Next →"
          variant="secondary"
          fontSize={12}
          uiTransform={{ width: 90, height: 30 }}
          onMouseDown={onNext}
        />
      </UiEntity>
    </UiEntity>
  )
}
