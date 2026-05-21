import { engine, Transform, MeshRenderer } from '@dcl/sdk/ecs'

export function main() {
  const cube = engine.addEntity()
  Transform.create(cube, { position: { x: 8, y: 1, z: 8 } })
  MeshRenderer.setBox(cube)
}
