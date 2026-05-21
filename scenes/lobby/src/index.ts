import { engine, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { setupUi } from './ui'

export function main() {
  const floor = engine.addEntity()
  Transform.create(floor, {
    position: { x: 8, y: 0.05, z: 8 },
    scale: { x: 16, y: 0.1, z: 16 }
  })
  MeshRenderer.setBox(floor)
  Material.setPbrMaterial(floor, { albedoColor: Color4.fromHexString('#1a2332ff') })

  setupUi()
}
