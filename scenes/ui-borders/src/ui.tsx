import ReactEcs, { UiEntity, Label, type JSX } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

const PANEL_BG = { r: 0.12, g: 0.12, b: 0.18, a: 0.95 }
const LABEL_W = 260
const PANEL_W = 260
const PANEL_H = 160

const UniformBorder = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 100, left: '3%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Uniform color/width/radius"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: Color4.Red(),
        borderWidth: 4,
        borderRadius: 10
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <Label
        value="borderWidth: 4  borderRadius: 10"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={13}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const PerSideColor = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 100, left: '28%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Per-side borderColor"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: {
          top: Color4.White(),
          right: Color4.Blue(),
          bottom: Color4.Gray(),
          left: Color4.Red()
        },
        borderWidth: 6
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <Label
        value="T:white R:blue B:gray L:red"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={13}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const PerSideWidth = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 100, left: '53%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Per-side borderWidth"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: Color4.fromHexString('#FFD24A'),
        borderWidth: { top: 2, right: 8, bottom: 14, left: 4 }
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <Label
        value="T:2 R:8 B:14 L:4"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={13}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const PerCornerRadius = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 300, left: '3%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Per-corner borderRadius"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: Color4.fromHexString('#4AC0FF'),
        borderWidth: 3,
        borderRadius: { topLeft: 30, topRight: 30, bottomLeft: 0, bottomRight: 0 }
      }}
      uiBackground={{ color: { r: 0.1, g: 0.2, b: 0.3, a: 0.95 } }}
    >
      <Label
        value="TL/TR:30  BL/BR:0"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={13}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const FullyMixed = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 300, left: '28%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Mixed color + width + radius"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: {
          top: Color4.White(),
          left: Color4.Red(),
          right: Color4.Blue(),
          bottom: Color4.Gray()
        },
        borderWidth: { top: 3, left: 2, right: 3, bottom: 4 },
        borderRadius: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 0 }
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <Label
        value="docs example, BR corner sharp"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={12}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const RadiusNoBorder = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 300, left: '53%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Radius only  no borderWidth"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderRadius: 30
      }}
      uiBackground={{ color: { r: 0.2, g: 0.55, b: 0.35, a: 0.95 } }}
    >
      <Label
        value="rounded background, no stroke"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={13}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const PercentWidth = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 500, left: '3%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Percentage borderWidth ('2%')"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: Color4.fromHexString('#FF66CC'),
        borderWidth: '2%',
        borderRadius: 8
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <Label
        value="borderWidth: '2%' of width"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={13}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const Circle = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 500, left: '28%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Circle  radius = width/2"
      uiTransform={{ width: LABEL_W, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: 160,
        height: 160,
        borderColor: Color4.fromHexString('#FFAA22'),
        borderWidth: 6,
        borderRadius: 80
      }}
      uiBackground={{ color: { r: 0.25, g: 0.15, b: 0.05, a: 0.95 } }}
    >
      <Label
        value="circle"
        uiTransform={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        fontSize={14}
        color={Color4.White()}
      />
    </UiEntity>
  </UiEntity>
)

const NestedBorder = (): JSX.Element => (
  <UiEntity
    uiTransform={{
      positionType: 'absolute',
      position: { top: 500, left: '53%' },
      flexDirection: 'column'
    }}
  >
    <Label
      value="Nested  child border inside rounded parent"
      uiTransform={{ width: 300, height: 22 }}
      fontSize={13}
      color={Color4.White()}
    />
    <UiEntity
      uiTransform={{
        width: PANEL_W,
        height: PANEL_H,
        borderColor: Color4.White(),
        borderWidth: 2,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{ color: PANEL_BG }}
    >
      <UiEntity
        uiTransform={{
          width: 200,
          height: 100,
          borderColor: Color4.fromHexString('#22FFAA'),
          borderWidth: 3,
          borderRadius: 12
        }}
        uiBackground={{ color: { r: 0.1, g: 0.3, b: 0.25, a: 0.95 } }}
      >
        <Label
          value="child with own border"
          uiTransform={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          fontSize={13}
          color={Color4.White()}
        />
      </UiEntity>
    </UiEntity>
  </UiEntity>
)

export const ui = (): JSX.Element => (
  <UiEntity uiTransform={{ width: '100%', height: '100%' }}>
    <UniformBorder />
    <PerSideColor />
    <PerSideWidth />
    <PerCornerRadius />
    <FullyMixed />
    <RadiusNoBorder />
    <PercentWidth />
    <Circle />
    <NestedBorder />
  </UiEntity>
)
