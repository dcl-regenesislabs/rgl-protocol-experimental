import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

type Demo = {
  name: string
  description: string
  parcel: string
  direction: string
}

const DEMOS: Demo[] = [
  {
    name: 'Scrollable UI',
    description:
      'New UiTransform fields from decentraland/protocol#412 — overflow=scroll, scrollPosition, scrollVisible, elementId, and UiScrollResult readback.',
    parcel: '1,0',
    direction: 'walk east →'
  }
]

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(LobbyUi)
}

const LobbyUi = () => (
  <UiEntity
    uiTransform={{
      width: 580,
      height: 'auto',
      positionType: 'absolute',
      position: { top: '12%', left: '50%' },
      margin: '0 0 0 -290px',
      flexDirection: 'column',
      padding: 20
    }}
    uiBackground={{ color: Color4.create(0.04, 0.06, 0.1, 0.94) }}
  >
    <Label
      value="RGL Protocol — Demo Lobby"
      fontSize={26}
      color={Color4.fromHexString('#7cffb2ff')}
      uiTransform={{ width: '100%', height: 36 }}
    />
    <Label
      value="Walk to each parcel to explore experimental Decentraland protocol features."
      fontSize={13}
      color={Color4.fromHexString('#aaaaaaff')}
      uiTransform={{ width: '100%', height: 22, margin: '0 0 14 0' }}
    />
    {DEMOS.map((d) => (
      <UiEntity
        key={d.name}
        uiTransform={{
          width: '100%',
          height: 100,
          flexDirection: 'column',
          padding: 12,
          margin: '0 0 8 0'
        }}
        uiBackground={{ color: Color4.create(0.1, 0.15, 0.22, 1) }}
      >
        <Label
          value={d.name}
          fontSize={18}
          color={Color4.White()}
          uiTransform={{ width: '100%', height: 26 }}
        />
        <Label
          value={d.description}
          fontSize={12}
          color={Color4.fromHexString('#bbbbbbff')}
          uiTransform={{ width: '100%', height: 36, margin: '2 0' }}
        />
        <Label
          value={`Parcel ${d.parcel}  —  ${d.direction}`}
          fontSize={12}
          color={Color4.fromHexString('#7cffb2ff')}
          uiTransform={{ width: '100%', height: 18 }}
        />
      </UiEntity>
    ))}
  </UiEntity>
)
