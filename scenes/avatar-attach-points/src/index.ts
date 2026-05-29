import {
  engine,
  Transform,
  MeshRenderer,
  Material,
  TextShape,
  Billboard,
  AvatarAttach,
  AvatarAnchorPointType,
  type Entity
} from '@dcl/sdk/ecs'
import { Color3, Color4, Vector3 } from '@dcl/sdk/math'

// All 26 avatar anchor points (AvatarAnchorPointType, values 0..25).
// A small marker box + billboard label is attached to each one on the
// local player's avatar via the AvatarAttach component.
const ANCHOR_POINTS: { type: AvatarAnchorPointType; name: string }[] = [
  { type: AvatarAnchorPointType.AAPT_POSITION, name: 'POSITION' },
  { type: AvatarAnchorPointType.AAPT_NAME_TAG, name: 'NAME_TAG' },
  { type: AvatarAnchorPointType.AAPT_HEAD, name: 'HEAD' },
  { type: AvatarAnchorPointType.AAPT_NECK, name: 'NECK' },
  { type: AvatarAnchorPointType.AAPT_SPINE, name: 'SPINE' },
  { type: AvatarAnchorPointType.AAPT_SPINE1, name: 'SPINE1' },
  { type: AvatarAnchorPointType.AAPT_SPINE2, name: 'SPINE2' },
  { type: AvatarAnchorPointType.AAPT_HIP, name: 'HIP' },
  { type: AvatarAnchorPointType.AAPT_LEFT_SHOULDER, name: 'LEFT_SHOULDER' },
  { type: AvatarAnchorPointType.AAPT_LEFT_ARM, name: 'LEFT_ARM' },
  { type: AvatarAnchorPointType.AAPT_LEFT_FOREARM, name: 'LEFT_FOREARM' },
  { type: AvatarAnchorPointType.AAPT_LEFT_HAND, name: 'LEFT_HAND' },
  { type: AvatarAnchorPointType.AAPT_LEFT_HAND_INDEX, name: 'LEFT_HAND_INDEX' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_SHOULDER, name: 'RIGHT_SHOULDER' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_ARM, name: 'RIGHT_ARM' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_FOREARM, name: 'RIGHT_FOREARM' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_HAND, name: 'RIGHT_HAND' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_HAND_INDEX, name: 'RIGHT_HAND_INDEX' },
  { type: AvatarAnchorPointType.AAPT_LEFT_UP_LEG, name: 'LEFT_UP_LEG' },
  { type: AvatarAnchorPointType.AAPT_LEFT_LEG, name: 'LEFT_LEG' },
  { type: AvatarAnchorPointType.AAPT_LEFT_FOOT, name: 'LEFT_FOOT' },
  { type: AvatarAnchorPointType.AAPT_LEFT_TOE_BASE, name: 'LEFT_TOE_BASE' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_UP_LEG, name: 'RIGHT_UP_LEG' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_LEG, name: 'RIGHT_LEG' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_FOOT, name: 'RIGHT_FOOT' },
  { type: AvatarAnchorPointType.AAPT_RIGHT_TOE_BASE, name: 'RIGHT_TOE_BASE' }
]

// Spread a distinct hue across the anchor points so each marker is easy to tell
// apart. Simple HSV->RGB (s and v fixed) so we don't depend on a math helper.
function hueColor(index: number, total: number): Color4 {
  const h = ((index / total) * 360) / 60
  const s = 0.85
  const v = 1
  const c = v * s
  const x = c * (1 - Math.abs((h % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0
  if (h < 1) [r, g, b] = [c, x, 0]
  else if (h < 2) [r, g, b] = [x, c, 0]
  else if (h < 3) [r, g, b] = [0, c, x]
  else if (h < 4) [r, g, b] = [0, x, c]
  else if (h < 5) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return Color4.create(r + m, g + m, b + m, 1)
}

export function main() {
  // Reference floor so the player has something to stand on inside the parcel.
  const floor = engine.addEntity()
  Transform.create(floor, {
    position: Vector3.create(8, 0.05, 8),
    scale: Vector3.create(16, 0.1, 16)
  })
  MeshRenderer.setBox(floor)
  Material.setPbrMaterial(floor, { albedoColor: Color4.fromHexString('#1b2233ff') })

  // Title sign.
  const title = engine.addEntity()
  Transform.create(title, { position: Vector3.create(8, 3, 8) })
  TextShape.create(title, {
    text: 'AVATAR ATTACH POINTS\nAll 26 AvatarAnchorPointType anchors\nattached to your avatar',
    fontSize: 3,
    textColor: Color4.White(),
    outlineWidth: 0.2,
    outlineColor: Color3.Black()
  })
  Billboard.create(title)

  // Every visual entity attached to the avatar, paired with its normal scale.
  // We toggle these between their real scale and zero so the markers only show
  // while the player is standing inside the scene. (VisibilityComponent is not
  // used because it does not hide TextShape labels — scaling does.)
  const attachedVisuals: { entity: Entity; scale: Vector3 }[] = []

  // Attach a marker + label to every anchor point on the local player's avatar.
  ANCHOR_POINTS.forEach((anchor, i) => {
    const color = hueColor(i, ANCHOR_POINTS.length)

    // The AvatarAttach entity's Transform is overridden by the component, so we
    // attach children to it and offset/scale those instead.
    const attach = engine.addEntity()
    Transform.create(attach, {})
    AvatarAttach.create(attach, { anchorPointId: anchor.type })

    // Small marker cube sitting right on the anchor.
    const markerScale = Vector3.create(0.07, 0.07, 0.07)
    const marker = engine.addEntity()
    Transform.create(marker, {
      parent: attach,
      position: Vector3.Zero(),
      scale: markerScale
    })
    MeshRenderer.setBox(marker)
    Material.setPbrMaterial(marker, {
      albedoColor: color,
      emissiveColor: Color3.create(color.r, color.g, color.b),
      emissiveIntensity: 0.6
    })

    // Billboard label naming the anchor, floating just above the marker.
    const labelScale = Vector3.One()
    const label = engine.addEntity()
    Transform.create(label, {
      parent: attach,
      position: Vector3.create(0, 0.12, 0),
      scale: labelScale
    })
    TextShape.create(label, {
      text: anchor.name,
      fontSize: 0.5,
      textColor: color,
      outlineWidth: 0.25,
      outlineColor: Color3.Black()
    })
    Billboard.create(label)

    attachedVisuals.push({ entity: marker, scale: markerScale }, { entity: label, scale: labelScale })
  })

  console.log(`[ATTACH] Attached markers to all ${ANCHOR_POINTS.length} avatar anchor points`)

  // Avatar-attached entities follow the player everywhere, including out of this
  // scene. Watch the player's position and only show the markers while they are
  // inside the scene bounds (a single 16x16 parcel, scene-local 0..16 on x/z).
  const SCENE_MIN = 0
  const SCENE_MAX = 16
  let markersVisible: boolean | undefined = undefined

  function setMarkersVisible(visible: boolean) {
    if (visible === markersVisible) return
    markersVisible = visible
    for (const { entity, scale } of attachedVisuals) {
      Transform.getMutable(entity).scale = visible ? scale : Vector3.Zero()
    }
    console.log(`[ATTACH] markers ${visible ? 'shown (player inside scene)' : 'hidden (player left scene)'}`)
  }

  engine.addSystem(() => {
    const playerTransform = Transform.getOrNull(engine.PlayerEntity)
    if (!playerTransform) return
    const { x, z } = playerTransform.position
    const inside = x >= SCENE_MIN && x <= SCENE_MAX && z >= SCENE_MIN && z <= SCENE_MAX
    setMarkersVisible(inside)
  })
}
