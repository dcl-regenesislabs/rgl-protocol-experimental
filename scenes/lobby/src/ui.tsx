import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'
import { teleportTo } from '~system/RestrictedActions'
import { DEMOS, type Demo } from './generated/demos'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(LobbyUi)
}

const directionLabel = (base: { x: number; y: number }) => {
  const parts: string[] = []
  if (base.x > 0) parts.push(`${base.x === 1 ? '' : `${base.x} `}east`)
  else if (base.x < 0) parts.push(`${base.x === -1 ? '' : `${Math.abs(base.x)} `}west`)
  if (base.y > 0) parts.push(`${base.y === 1 ? '' : `${base.y} `}north`)
  else if (base.y < 0) parts.push(`${base.y === -1 ? '' : `${Math.abs(base.y)} `}south`)
  return parts.length === 0 ? 'here' : `${parts.join(' / ')} →`
}

const onTeleport = (demo: Demo) => () => {
  void teleportTo({ worldCoordinates: { x: demo.base.x, y: demo.base.y } })
}

const LobbyUi = () => (
  <UiEntity
    uiTransform={{
      width: 620,
      height: 'auto',
      positionType: 'absolute',
      position: { top: '12%', left: '50%' },
      margin: '0 0 0 -310px',
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
      value="Walk to each parcel — or use the teleport button — to explore experimental Decentraland protocol features."
      fontSize={13}
      color={Color4.fromHexString('#aaaaaaff')}
      uiTransform={{ width: '100%', height: 22, margin: '0 0 14 0' }}
    />
    {DEMOS.map((demo) => (
      <UiEntity
        key={demo.scene}
        uiTransform={{
          width: '100%',
          height: 'auto',
          flexDirection: 'row',
          padding: 12,
          margin: '0 0 8 0'
        }}
        uiBackground={{ color: Color4.create(0.1, 0.15, 0.22, 1) }}
      >
        <UiEntity
          uiTransform={{
            width: '70%',
            height: 'auto',
            flexDirection: 'column'
          }}
        >
          <Label
            value={demo.title}
            fontSize={18}
            color={Color4.White()}
            uiTransform={{ width: '100%', height: 26 }}
          />
          <Label
            value={demo.description}
            fontSize={12}
            color={Color4.fromHexString('#bbbbbbff')}
            uiTransform={{ width: '100%', height: 36, margin: '2 0' }}
          />
          <Label
            value={`Parcel ${demo.base.x},${demo.base.y}  —  ${directionLabel(demo.base)}`}
            fontSize={12}
            color={Color4.fromHexString('#7cffb2ff')}
            uiTransform={{ width: '100%', height: 18 }}
          />
        </UiEntity>
        <UiEntity
          uiTransform={{
            width: '30%',
            height: 80,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 6
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 56,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            uiBackground={{ color: Color4.fromHexString('#7cffb2ff') }}
            onMouseDown={onTeleport(demo)}
          >
            <Label
              value="TELEPORT →"
              fontSize={14}
              color={Color4.fromHexString('#04140aff')}
              uiTransform={{ width: '100%', height: 20 }}
              textAlign="middle-center"
            />
          </UiEntity>
        </UiEntity>
      </UiEntity>
    ))}
  </UiEntity>
)
