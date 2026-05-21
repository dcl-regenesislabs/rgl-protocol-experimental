import {
  ColliderLayer,
  engine,
  GltfContainer,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  Transform,
  UiScrollResult
} from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'
import { setupUi, toggleUi, userScroll } from './ui'

const BUTTON_GLB = 'assets/asset-packs/button_panel/ButtonPanel_01/ButtonPanel_01.glb'

export function main() {
  const floor = engine.addEntity()
  Transform.create(floor, {
    position: { x: 8, y: 0.05, z: 8 },
    scale: { x: 16, y: 0.1, z: 16 }
  })
  MeshRenderer.setBox(floor)
  Material.setPbrMaterial(floor, { albedoColor: Color4.fromHexString('#162033ff') })

  const openButton = engine.addEntity()
  Transform.create(openButton, {
    position: { x: 8, y: 1.2, z: 4 },
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    scale: { x: 1.2, y: 1.2, z: 1.2 }
  })
  GltfContainer.create(openButton, { src: BUTTON_GLB })
  MeshCollider.setBox(openButton, ColliderLayer.CL_POINTER)
  pointerEventsSystem.onPointerDown(
    {
      entity: openButton,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Open menu',
        showFeedback: true,
        maxDistance: 8
      }
    },
    () => toggleUi()
  )

  engine.addSystem(() => {
    for (const [, result] of engine.getEntitiesWith(UiScrollResult)) {
      if (result.value) {
        userScroll.x = result.value.x
        userScroll.y = result.value.y
      }
    }
  })

  setupUi()
}
