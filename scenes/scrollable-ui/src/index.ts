import { engine, Material, MeshRenderer, Transform, UiScrollResult } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { setupUi, userScroll } from './ui'

export function main() {
  const floor = engine.addEntity()
  Transform.create(floor, {
    position: { x: 24, y: 0.05, z: 8 },
    scale: { x: 16, y: 0.1, z: 16 }
  })
  MeshRenderer.setBox(floor)
  Material.setPbrMaterial(floor, { albedoColor: Color4.fromHexString('#162033ff') })

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
