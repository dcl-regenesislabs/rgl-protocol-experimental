import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

const { useState } = ReactEcs

type TabId = 'element' | 'offset' | 'visible' | 'read'

type TabConfig = {
  id: TabId
  label: string
  image: string
  imageW: number
  imageH: number
}

const TABS: TabConfig[] = [
  {
    id: 'element',
    label: 'SCROLL TO ELEMENT',
    image: 'assets/examples/02-scroll-to-element.png',
    imageW: 909,
    imageH: 850
  },
  {
    id: 'offset',
    label: 'SCROLL TO OFFSET',
    image: 'assets/examples/03-scroll-to-offset.png',
    imageW: 765,
    imageH: 850
  },
  {
    id: 'visible',
    label: 'SCROLL VISIBLE',
    image: 'assets/examples/04-scroll-visible.png',
    imageW: 741,
    imageH: 730
  },
  {
    id: 'read',
    label: 'READ SCROLL POSITION',
    image: 'assets/examples/05-read-scroll-position.png',
    imageW: 757,
    imageH: 562
  }
]

const ITEMS = Array.from({ length: 40 }, (_, i) => ({
  id: `item-${i}`,
  label: `Section ${i + 1}`
}))

const SCROLL_MODES = ['vertical', 'horizontal', 'both', 'hidden'] as const
type ScrollMode = (typeof SCROLL_MODES)[number]

export const userScroll = { x: 0, y: 0 }

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(DemoUi)
}

const PANEL_W = 1080
const PANEL_H = 680
const IMAGE_BOX_W = 520
const IMAGE_BOX_H = 500

const fitContain = (imgW: number, imgH: number, maxW: number, maxH: number) => {
  const s = Math.min(maxW / imgW, maxH / imgH)
  return { w: Math.round(imgW * s), h: Math.round(imgH * s) }
}

const DemoUi = () => {
  const [activeId, setActiveId] = useState<TabId>('element')
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0]
  const img = fitContain(active.imageW, active.imageH, IMAGE_BOX_W, IMAGE_BOX_H)

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
      <UiEntity
        uiTransform={{
          width: PANEL_W,
          height: PANEL_H,
          flexDirection: 'column',
          padding: 16
        }}
        uiBackground={{ color: Color4.create(0.04, 0.06, 0.1, 0.94) }}
      >
        <Label
          value="Scrollable UI Demo"
          fontSize={22}
          color={Color4.fromHexString('#7cffb2ff')}
          uiTransform={{ width: '100%', height: 30 }}
        />
        <Label
          value="protocol#412 — overflow=scroll, scrollVisible, elementId, scrollPosition, UiScrollResult"
          fontSize={11}
          color={Color4.fromHexString('#888888ff')}
          uiTransform={{ width: '100%', height: 18, margin: '0 0 10 0' }}
        />

        <UiEntity
          uiTransform={{
            width: '100%',
            height: 36,
            flexDirection: 'row',
            margin: '0 0 12 0'
          }}
        >
          {TABS.map((t) => (
            <Button
              key={t.id}
              value={t.label}
              variant={t.id === activeId ? 'primary' : 'secondary'}
              fontSize={11}
              uiTransform={{ width: 200, height: 32, margin: '0 6 0 0' }}
              onMouseDown={() => setActiveId(t.id)}
            />
          ))}
        </UiEntity>

        <UiEntity
          uiTransform={{
            width: '100%',
            flexGrow: 1,
            flexDirection: 'row'
          }}
        >
          <UiEntity
            uiTransform={{
              width: IMAGE_BOX_W,
              height: '100%',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 16 0 0'
            }}
            uiBackground={{ color: Color4.create(0, 0, 0, 0.25) }}
          >
            <UiEntity
              uiTransform={{ width: img.w, height: img.h }}
              uiBackground={{
                texture: { src: active.image },
                textureMode: 'stretch'
              }}
            />
          </UiEntity>

          <UiEntity
            uiTransform={{
              flexGrow: 1,
              height: '100%',
              flexDirection: 'column'
            }}
          >
            {activeId === 'element' ? <ScrollToElementDemo /> : null}
            {activeId === 'offset' ? <ScrollToOffsetDemo /> : null}
            {activeId === 'visible' ? <ScrollVisibleDemo /> : null}
            {activeId === 'read' ? <ReadScrollDemo /> : null}
          </UiEntity>
        </UiEntity>
      </UiEntity>
    </UiEntity>
  )
}

const ScrollToElementDemo = () => {
  const [target, setTarget] = useState<string | undefined>(undefined)

  return (
    <UiEntity uiTransform={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <UiEntity
        uiTransform={{ width: '100%', height: 32, flexDirection: 'row', margin: '0 0 6 0' }}
      >
        <Button
          value="Top (item-0)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 100, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget('item-0')}
        />
        <Button
          value="Mid (item-20)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 108, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget('item-20')}
        />
        <Button
          value="End (item-39)"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 108, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget('item-39')}
        />
        <Button
          value="Release"
          variant="primary"
          fontSize={11}
          uiTransform={{ width: 80, height: 28 }}
          onMouseDown={() => setTarget(undefined)}
        />
      </UiEntity>
      <Label
        value={`scrollPosition = ${target === undefined ? 'undefined' : `"${target}"`}`}
        fontSize={11}
        color={Color4.fromHexString('#7cffb2ff')}
        uiTransform={{ width: '100%', height: 18, margin: '0 0 4 0' }}
      />
      <ScrollViewport scrollPosition={target} scrollVisible="vertical" />
    </UiEntity>
  )
}

const ScrollToOffsetDemo = () => {
  const [target, setTarget] = useState<{ x: number; y: number } | undefined>(undefined)

  return (
    <UiEntity uiTransform={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <UiEntity
        uiTransform={{ width: '100%', height: 32, flexDirection: 'row', margin: '0 0 6 0' }}
      >
        <Button
          value="y = 0"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 76, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget({ x: 0, y: 0 })}
        />
        <Button
          value="y = 0.25"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 84, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget({ x: 0, y: 0.25 })}
        />
        <Button
          value="y = 0.5"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 84, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget({ x: 0, y: 0.5 })}
        />
        <Button
          value="y = 1"
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 76, height: 28, margin: '0 4 0 0' }}
          onMouseDown={() => setTarget({ x: 0, y: 1 })}
        />
        <Button
          value="Release"
          variant="primary"
          fontSize={11}
          uiTransform={{ width: 80, height: 28 }}
          onMouseDown={() => setTarget(undefined)}
        />
      </UiEntity>
      <Label
        value={`scrollPosition = ${
          target === undefined
            ? 'undefined'
            : `{ x: ${target.x.toFixed(2)}, y: ${target.y.toFixed(2)} }   (normalized 0..1)`
        }`}
        fontSize={11}
        color={Color4.fromHexString('#7cffb2ff')}
        uiTransform={{ width: '100%', height: 18, margin: '0 0 4 0' }}
      />
      <ScrollViewport scrollPosition={target} scrollVisible="vertical" />
    </UiEntity>
  )
}

const ScrollVisibleDemo = () => {
  const [mode, setMode] = useState<ScrollMode>('vertical')
  const cycle = () =>
    setMode(SCROLL_MODES[(SCROLL_MODES.indexOf(mode) + 1) % SCROLL_MODES.length])

  return (
    <UiEntity uiTransform={{ width: '100%', height: '100%', flexDirection: 'column' }}>
      <UiEntity
        uiTransform={{ width: '100%', height: 32, flexDirection: 'row', margin: '0 0 6 0' }}
      >
        <Button
          value={`Click to cycle — currently: ${mode}`}
          variant="secondary"
          fontSize={11}
          uiTransform={{ width: 280, height: 28 }}
          onMouseDown={cycle}
        />
      </UiEntity>
      <Label
        value={`scrollVisible = "${mode}"   (content is wider than viewport to exercise the horizontal bar)`}
        fontSize={10}
        color={Color4.fromHexString('#888888ff')}
        uiTransform={{ width: '100%', height: 16, margin: '0 0 4 0' }}
      />
      <ScrollViewport scrollVisible={mode} itemWidth={720} />
    </UiEntity>
  )
}

const ReadScrollDemo = () => (
  <UiEntity uiTransform={{ width: '100%', height: '100%', flexDirection: 'column' }}>
    <Label
      value={`UiScrollResult → { x: ${userScroll.x.toFixed(3)}, y: ${userScroll.y.toFixed(3)} }   (normalized 0..1)`}
      fontSize={13}
      color={Color4.fromHexString('#7cffb2ff')}
      uiTransform={{ width: '100%', height: 24, margin: '0 0 4 0' }}
    />
    <Label
      value="Scroll the list — the values above update from UiScrollResult in real time."
      fontSize={10}
      color={Color4.fromHexString('#888888ff')}
      uiTransform={{ width: '100%', height: 16, margin: '0 0 6 0' }}
    />
    <ScrollViewport scrollVisible="vertical" />
  </UiEntity>
)

type ViewportProps = {
  scrollPosition?: string | { x: number; y: number }
  scrollVisible: ScrollMode
  itemWidth?: number
}

const ScrollViewport = (props: ViewportProps) => {
  const itemWidth = props.itemWidth ?? undefined

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        flexGrow: 1,
        overflow: 'scroll',
        scrollPosition: props.scrollPosition,
        scrollVisible: props.scrollVisible,
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
            width: itemWidth ?? '100%',
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
  )
}
