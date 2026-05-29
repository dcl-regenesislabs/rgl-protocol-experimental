import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TriggerArea,
  triggerAreaEventsSystem,
  ColliderLayer,
  Physics,
  KnockbackFalloff,
  MaterialTransparencyMode
} from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { createPlatform, createLabel } from '../utils/helpers'
import { runScoped, TestSceneHandle } from '../lobby/tracker'

/**
 * TEST 23: PLAYER PHYSICS
 * Covers every scenario from the player-physics docs:
 *  - applyImpulseToPlayer (vector + direction/magnitude overloads)
 *  - applyKnockbackToPlayer (CONSTANT / LINEAR / attraction)
 *  - applyForceToPlayer + removeForceFromPlayer (wind tunnel)
 *  - applyForceToPlayerForDuration (gust of wind)
 *  - applyRepulsionForceToPlayer (continuous repulsion + vortex/attraction)
 */
export function setupPlayerPhysicsTest(): TestSceneHandle {
  return runScoped(() => {
  // Re-based to the origin so the whole layout sits inside this scene's
  // parcels (0..4, 0..5). Content spans roughly x∈[1,65], z∈[2,92].
  const baseX = 18
  const baseZ = 22
  const floorY = 0.05

  createLabel(
    'PLAYER PHYSICS TEST\nImpulses, Forces, Knockback, Repulsion\n' +
      'Impulse rows -> PBPhysicsCombinedImpulse\nForce rows -> PBPhysicsCombinedForce',
    Vector3.create(baseX + 15, 9, baseZ - 12),
    3
  )

  // Shared platform floor
  createPlatform(
    Vector3.create(baseX + 15, floorY, baseZ + 25),
    Vector3.create(64, 0.1, 90),
    Color4.create(0.18, 0.18, 0.22, 1)
  )

  // =========================================================================
  // ROW 1: IMPULSES — applyImpulseToPlayer
  // =========================================================================
  const row1Z = baseZ

  createLabel('ROW 1: IMPULSES\nPBPhysicsCombinedImpulse', Vector3.create(baseX - 15, 3, row1Z), 2)

  // 1a. Vertical launch pad (vector overload)
  const launchPadVec = engine.addEntity()
  Transform.create(launchPadVec, {
    position: Vector3.create(baseX + 5, 0.5, row1Z),
    scale: Vector3.create(4, 1, 4)
  })
  MeshRenderer.setBox(launchPadVec)
  Material.setPbrMaterial(launchPadVec, { albedoColor: Color4.create(1.0, 0.3, 0.3, 1) })
  TriggerArea.setBox(launchPadVec, ColliderLayer.CL_PLAYER)
  triggerAreaEventsSystem.onTriggerEnter(launchPadVec, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.applyImpulseToPlayer(Vector3.create(0, 50, 0))
    console.log('[PHYSICS] Launch pad (vector): impulse (0, 50, 0)')
  })
  createLabel('LAUNCH PAD\nimpulse (0,50,0)\nvector overload\n[PBPhysicsCombinedImpulse]', Vector3.create(baseX + 5, 2.5, row1Z), 1.4)

  // 1b. Forward dash pad (direction + magnitude overload)
  const dashPad = engine.addEntity()
  Transform.create(dashPad, {
    position: Vector3.create(baseX + 15, 0.5, row1Z),
    scale: Vector3.create(4, 1, 4)
  })
  MeshRenderer.setBox(dashPad)
  Material.setPbrMaterial(dashPad, { albedoColor: Color4.create(1.0, 0.6, 0.2, 1) })
  TriggerArea.setBox(dashPad, ColliderLayer.CL_PLAYER)
  triggerAreaEventsSystem.onTriggerEnter(dashPad, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.applyImpulseToPlayer(Vector3.create(1, 0.4, 0), 35)
    console.log('[PHYSICS] Dash pad: impulse dir (1,0.4,0) mag 35')
  })
  createLabel('DASH PAD\ndir (1,0.4,0) mag 35\ndir+mag overload\n[PBPhysicsCombinedImpulse]', Vector3.create(baseX + 15, 2.5, row1Z), 1.4)

  // 1c. Multi-call accumulation pad (multiple impulses same frame)
  const stackPad = engine.addEntity()
  Transform.create(stackPad, {
    position: Vector3.create(baseX + 25, 0.5, row1Z),
    scale: Vector3.create(4, 1, 4)
  })
  MeshRenderer.setBox(stackPad)
  Material.setPbrMaterial(stackPad, { albedoColor: Color4.create(0.9, 0.9, 0.2, 1) })
  TriggerArea.setBox(stackPad, ColliderLayer.CL_PLAYER)
  triggerAreaEventsSystem.onTriggerEnter(stackPad, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.applyImpulseToPlayer(Vector3.create(0, 25, 0))
    Physics.applyImpulseToPlayer(Vector3.create(0, 25, 0))
    console.log('[PHYSICS] Stack pad: two impulses (0,25,0) accumulate -> ~50 up')
  })
  createLabel('STACK PAD\n2 impulses same frame\n(accumulate)\n[PBPhysicsCombinedImpulse]', Vector3.create(baseX + 25, 2.5, row1Z), 1.4)

  // =========================================================================
  // ROW 2: KNOCKBACK — applyKnockbackToPlayer (all falloff modes + attraction)
  // =========================================================================
  const row2Z = baseZ + 15

  createLabel('ROW 2: KNOCKBACK\nPBPhysicsCombinedImpulse\n(delegates to applyImpulse)', Vector3.create(baseX - 15, 3, row2Z), 2)

  // Each knockback uses a step plate trigger so the player can step in/out without spam.
  const makeKnockbackPlate = (
    x: number,
    color: Color4,
    label: string,
    detail: string,
    onEnter: () => void
  ) => {
    const plate = engine.addEntity()
    Transform.create(plate, {
      position: Vector3.create(x, 0.5, row2Z),
      scale: Vector3.create(3, 0.6, 3)
    })
    MeshRenderer.setBox(plate)
    Material.setPbrMaterial(plate, { albedoColor: color })
    TriggerArea.setBox(plate, ColliderLayer.CL_PLAYER)
    triggerAreaEventsSystem.onTriggerEnter(plate, (result) => {
      if (result.trigger?.entity !== engine.PlayerEntity) return
      onEnter()
    })
    createLabel(label + '\n' + detail + '\n[PBPhysicsCombinedImpulse]', Vector3.create(x, 2.5, row2Z), 1.3)
  }

  // 2a. CONSTANT falloff — uniform within radius
  const constSource = Vector3.create(baseX + 5, 1, row2Z + 4)
  const constMarker = engine.addEntity()
  Transform.create(constMarker, { position: constSource, scale: Vector3.create(0.6, 0.6, 0.6) })
  MeshRenderer.setSphere(constMarker)
  Material.setPbrMaterial(constMarker, { albedoColor: Color4.Red() })
  makeKnockbackPlate(
    baseX + 5,
    Color4.create(0.9, 0.2, 0.2, 1),
    'KNOCKBACK\nCONSTANT',
    'mag 40, radius 8',
    () => {
      Physics.applyKnockbackToPlayer(constSource, 40, 8, KnockbackFalloff.CONSTANT)
      console.log('[PHYSICS] Knockback CONSTANT mag=40 radius=8')
    }
  )

  // 2b. LINEAR falloff
  const linSource = Vector3.create(baseX + 15, 1, row2Z + 4)
  const linMarker = engine.addEntity()
  Transform.create(linMarker, { position: linSource, scale: Vector3.create(0.6, 0.6, 0.6) })
  MeshRenderer.setSphere(linMarker)
  Material.setPbrMaterial(linMarker, { albedoColor: Color4.create(1, 0.6, 0.2, 1) })
  makeKnockbackPlate(
    baseX + 15,
    Color4.create(0.9, 0.5, 0.2, 1),
    'KNOCKBACK\nLINEAR',
    'mag 50, radius 10',
    () => {
      Physics.applyKnockbackToPlayer(linSource, 50, 10, KnockbackFalloff.LINEAR)
      console.log('[PHYSICS] Knockback LINEAR mag=50 radius=10')
    }
  )

  // 2c. Attraction (negative magnitude pulls player toward source)
  const attractSource = Vector3.create(baseX + 35, 1, row2Z + 4)
  const attractMarker = engine.addEntity()
  Transform.create(attractMarker, { position: attractSource, scale: Vector3.create(0.6, 0.6, 0.6) })
  MeshRenderer.setSphere(attractMarker)
  Material.setPbrMaterial(attractMarker, { albedoColor: Color4.create(0.2, 0.9, 1, 1) })
  makeKnockbackPlate(
    baseX + 35,
    Color4.create(0.2, 0.7, 0.9, 1),
    'KNOCKBACK\nATTRACT',
    'mag -40 (pull in)',
    () => {
      Physics.applyKnockbackToPlayer(attractSource, -40, 15, KnockbackFalloff.LINEAR)
      console.log('[PHYSICS] Knockback negative mag (attraction) -40 radius=15')
    }
  )

  // =========================================================================
  // ROW 3: CONTINUOUS FORCE — applyForceToPlayer + removeForceFromPlayer
  // (Wind tunnel: ON while inside, OFF on exit.)
  // =========================================================================
  const row3Z = baseZ + 30

  createLabel('ROW 3: WIND TUNNEL\nPBPhysicsCombinedForce', Vector3.create(baseX - 15, 3, row3Z), 2)

  // Visible tunnel walls (collision walls, leave the middle as a corridor)
  createPlatform(
    Vector3.create(baseX + 15, 1.5, row3Z - 3),
    Vector3.create(20, 3, 0.4),
    Color4.create(0.3, 0.5, 0.7, 0.6)
  )
  createPlatform(
    Vector3.create(baseX + 15, 1.5, row3Z + 3),
    Vector3.create(20, 3, 0.4),
    Color4.create(0.3, 0.5, 0.7, 0.6)
  )

  const windTunnel = engine.addEntity()
  Transform.create(windTunnel, {
    position: Vector3.create(baseX + 15, 1.5, row3Z),
    scale: Vector3.create(20, 3, 5)
  })
  MeshRenderer.setBox(windTunnel)
  Material.setPbrMaterial(windTunnel, {
    albedoColor: Color4.create(0.4, 0.8, 1.0, 0.15),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  TriggerArea.setBox(windTunnel, ColliderLayer.CL_PLAYER)

  triggerAreaEventsSystem.onTriggerEnter(windTunnel, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    // Strong horizontal wind along +X
    Physics.applyForceToPlayer(windTunnel, Vector3.create(20, 0, 0))
    console.log('[PHYSICS] Wind tunnel: applyForceToPlayer (20,0,0)')
  })
  triggerAreaEventsSystem.onTriggerExit(windTunnel, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.removeForceFromPlayer(windTunnel)
    console.log('[PHYSICS] Wind tunnel: removeForceFromPlayer')
  })
  createLabel('WIND TUNNEL\napplyForceToPlayer +X\nremoved on exit\n[PBPhysicsCombinedForce]', Vector3.create(baseX + 15, 4.5, row3Z), 1.5)

  // 3b. Updraft (force separated direction + magnitude overload)
  const updraft = engine.addEntity()
  Transform.create(updraft, {
    position: Vector3.create(baseX + 30, 1.5, row3Z),
    scale: Vector3.create(4, 3, 4)
  })
  MeshRenderer.setBox(updraft)
  Material.setPbrMaterial(updraft, {
    albedoColor: Color4.create(0.2, 1.0, 0.6, 0.2),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  TriggerArea.setBox(updraft, ColliderLayer.CL_PLAYER)
  triggerAreaEventsSystem.onTriggerEnter(updraft, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.applyForceToPlayer(updraft, Vector3.create(0, 1, 0), 25)
    console.log('[PHYSICS] Updraft: applyForceToPlayer dir +Y mag 25')
  })
  triggerAreaEventsSystem.onTriggerExit(updraft, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.removeForceFromPlayer(updraft)
    console.log('[PHYSICS] Updraft: removed')
  })
  createLabel('UPDRAFT\ndir/mag overload\nfloats player up\n[PBPhysicsCombinedForce]', Vector3.create(baseX + 30, 4.5, row3Z), 1.5)

  // =========================================================================
  // ROW 4: TIME-LIMITED FORCE — applyForceToPlayerForDuration
  // =========================================================================
  const row4Z = baseZ + 45

  createLabel('ROW 4: TIMED GUSTS\nPBPhysicsCombinedForce', Vector3.create(baseX - 15, 3, row4Z), 2)

  // 4a. Horizontal gust — 2s, dir+mag overload, timer resets on re-enter
  const horizGust = engine.addEntity()
  Transform.create(horizGust, {
    position: Vector3.create(baseX + 15, 0.5, row4Z),
    scale: Vector3.create(4, 1, 4)
  })
  MeshRenderer.setBox(horizGust)
  Material.setPbrMaterial(horizGust, { albedoColor: Color4.create(0.9, 0.9, 0.3, 1) })
  TriggerArea.setBox(horizGust, ColliderLayer.CL_PLAYER)
  triggerAreaEventsSystem.onTriggerEnter(horizGust, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.applyForceToPlayerForDuration(horizGust, 2, Vector3.create(1, 0, 0), 30)
    console.log('[PHYSICS] Horizontal gust 2s dir +X mag 30 (timer resets on re-enter)')
  })
  createLabel('HORIZ GUST\n2s, dir +X mag 30\nresets on re-enter\n[PBPhysicsCombinedForce]', Vector3.create(baseX + 15, 2.5, row4Z), 1.4)

  // =========================================================================
  // ROW 5: REPULSION FORCE — applyRepulsionForceToPlayer
  // (Continuously recalculated each tick; ON in zone, OFF on exit.)
  // =========================================================================
  const row5Z = baseZ + 60

  createLabel('ROW 5: REPULSION / VORTEX\nPBPhysicsCombinedForce\n(removed with removeForceFromPlayer)', Vector3.create(baseX - 15, 3, row5Z), 2)

  // 5a. Repulsion pillar — pushes player outward continuously
  const repulsionPillar = engine.addEntity()
  Transform.create(repulsionPillar, {
    position: Vector3.create(baseX + 10, 1.5, row5Z),
    scale: Vector3.create(1, 3, 1)
  })
  MeshRenderer.setCylinder(repulsionPillar)
  Material.setPbrMaterial(repulsionPillar, { albedoColor: Color4.create(1.0, 0.4, 0.2, 1) })

  const repulsionZone = engine.addEntity()
  Transform.create(repulsionZone, {
    position: Vector3.create(baseX + 10, 1.5, row5Z),
    scale: Vector3.create(14, 3, 14)
  })
  MeshRenderer.setBox(repulsionZone)
  Material.setPbrMaterial(repulsionZone, {
    albedoColor: Color4.create(1.0, 0.4, 0.2, 0.1),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  TriggerArea.setBox(repulsionZone, ColliderLayer.CL_PLAYER)

  triggerAreaEventsSystem.onTriggerEnter(repulsionZone, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    const origin = Transform.get(repulsionPillar).position
    Physics.applyRepulsionForceToPlayer(repulsionZone, origin, 60, 8, KnockbackFalloff.LINEAR)
    console.log('[PHYSICS] Repulsion ON mag=60 radius=8 LINEAR')
  })
  triggerAreaEventsSystem.onTriggerExit(repulsionZone, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.removeForceFromPlayer(repulsionZone)
    console.log('[PHYSICS] Repulsion OFF')
  })
  createLabel('REPULSION PILLAR\nmag 60, radius 8\nLINEAR falloff\n[PBPhysicsCombinedForce]', Vector3.create(baseX + 10, 5, row5Z), 1.5)

  // 5b. Vortex / black hole — repulsion with negative magnitude pulls inward
  const vortexCore = engine.addEntity()
  Transform.create(vortexCore, {
    position: Vector3.create(baseX + 30, 1.5, row5Z),
    scale: Vector3.create(1.2, 1.2, 1.2)
  })
  MeshRenderer.setSphere(vortexCore)
  Material.setPbrMaterial(vortexCore, {
    albedoColor: Color4.create(0.1, 0.1, 0.3, 1),
    emissiveColor: { r: 0.2, g: 0.0, b: 0.6 },
    emissiveIntensity: 2
  })

  const vortexZone = engine.addEntity()
  Transform.create(vortexZone, {
    position: Vector3.create(baseX + 30, 1.5, row5Z),
    scale: Vector3.create(14, 3, 14)
  })
  MeshRenderer.setBox(vortexZone)
  Material.setPbrMaterial(vortexZone, {
    albedoColor: Color4.create(0.3, 0.1, 0.6, 0.1),
    transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
  })
  TriggerArea.setBox(vortexZone, ColliderLayer.CL_PLAYER)

  triggerAreaEventsSystem.onTriggerEnter(vortexZone, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    const origin = Transform.get(vortexCore).position
    // Negative magnitude = attraction
    Physics.applyRepulsionForceToPlayer(vortexZone, origin, -45, 8, KnockbackFalloff.INVERSE_SQUARE)
    console.log('[PHYSICS] Vortex ON mag=-45 radius=8 INVERSE_SQUARE (attracts)')
  })
  triggerAreaEventsSystem.onTriggerExit(vortexZone, (result) => {
    if (result.trigger?.entity !== engine.PlayerEntity) return
    Physics.removeForceFromPlayer(vortexZone)
    console.log('[PHYSICS] Vortex OFF')
  })
  createLabel('VORTEX\nmag -45 (attract)\nINVERSE_SQUARE\n[PBPhysicsCombinedForce]', Vector3.create(baseX + 30, 5, row5Z), 1.5)

  // =========================================================================
  // Instructions
  // =========================================================================
  createLabel(
    'WALK ONTO PADS / INTO ZONES TO TEST.\nCheck the console for [PHYSICS] logs.',
    Vector3.create(baseX + 15, 1, baseZ - 6),
    1.6
  )
  })
}
