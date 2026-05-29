import {
  engine,
  Transform,
  MeshRenderer,
  MeshCollider,
  Material,
  TextShape,
  Billboard,
  PointerEvents,
  PointerEventType,
  InputAction,
  Schemas,
  Entity
} from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion, Color3 } from '@dcl/sdk/math'

// ============================================================================
// CONTROL MAPPING TYPES AND CONSTANTS
// ============================================================================

export type InputActionInfo = {
  action: InputAction
  name: string
  key: string
  color: Color4
}

export const INPUT_ACTIONS: InputActionInfo[] = [
  { action: InputAction.IA_POINTER, name: 'POINTER', key: 'Left Click', color: Color4.Red() },
  { action: InputAction.IA_PRIMARY, name: 'PRIMARY', key: 'E Key', color: Color4.Green() },
  { action: InputAction.IA_SECONDARY, name: 'SECONDARY', key: 'F Key', color: Color4.Blue() },
  { action: InputAction.IA_ACTION_3, name: 'ACTION_3', key: '1 Key', color: Color4.Yellow() },
  { action: InputAction.IA_ACTION_4, name: 'ACTION_4', key: '2 Key', color: Color4.create(0, 1, 1, 1) },
  { action: InputAction.IA_ACTION_5, name: 'ACTION_5', key: '3 Key', color: Color4.Magenta() },
  { action: InputAction.IA_ACTION_6, name: 'ACTION_6', key: '4 Key', color: Color4.create(1, 0.5, 0, 1) },
  { action: InputAction.IA_JUMP, name: 'JUMP', key: 'Space', color: Color4.Purple() },
  { action: InputAction.IA_FORWARD, name: 'FORWARD', key: 'W Key', color: Color4.White() },
  { action: InputAction.IA_BACKWARD, name: 'BACKWARD', key: 'S Key', color: Color4.Gray() },
  { action: InputAction.IA_LEFT, name: 'LEFT', key: 'A Key', color: Color4.create(1, 0.75, 0.8, 1) },
  { action: InputAction.IA_RIGHT, name: 'RIGHT', key: 'D Key', color: Color4.create(0, 0.5, 0.5, 1) }
]

export const DEFAULT_COLOR = Color4.create(0.5, 0.5, 0.5, 1)

// ============================================================================
// CUSTOM COMPONENTS
// ============================================================================

export const CubeInputState = engine.defineComponent('CubeInputState', {
  actions: Schemas.Array(Schemas.Int),
  currentColor: Schemas.Int,
  isPressed: Schemas.Boolean,
  isMasterCube: Schemas.Boolean
})

export const HoverState = engine.defineComponent('HoverState', {
  isHovered: Schemas.Boolean,
  lastAction: Schemas.String
})

export const TriggerVisual = engine.defineComponent('TriggerVisual', {
  isPlayerInside: Schemas.Boolean
})

export const RotatingTrigger = engine.defineComponent('RotatingTrigger', {
  speed: Schemas.Float
})

export const MovingTrigger = engine.defineComponent('MovingTrigger', {
  startPos: Schemas.Float,
  endPos: Schemas.Float,
  speed: Schemas.Float,
  direction: Schemas.Float,
  axis: Schemas.Float
})

export const ScalingTrigger = engine.defineComponent('ScalingTrigger', {
  minScale: Schemas.Float,
  maxScale: Schemas.Float,
  speed: Schemas.Float,
  direction: Schemas.Float,
  currentScale: Schemas.Float
})

// ============================================================================
// COLORS
// ============================================================================

export const TRIGGER_COLOR_OUTSIDE = Color4.create(1.0, 0.0, 0.0, 0.5)
export const TRIGGER_COLOR_INSIDE = Color4.create(0.0, 1.0, 0.0, 0.5)

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a platform cube with collider and material
 */
export function createPlatform(
  position: Vector3,
  scale: Vector3,
  color: Color4
): Entity {
  const platform = engine.addEntity()

  Transform.create(platform, {
    position: position,
    scale: scale
  })

  MeshRenderer.setBox(platform)
  MeshCollider.setBox(platform)

  Material.setPbrMaterial(platform, {
    albedoColor: color
  })

  return platform
}

/**
 * Creates a ramp with rotation
 */
export function createRamp(
  position: Vector3,
  scale: Vector3,
  rotationDegrees: number,
  color: Color4
): Entity {
  const ramp = engine.addEntity()

  Transform.create(ramp, {
    position: position,
    scale: scale,
    rotation: Quaternion.fromEulerDegrees(rotationDegrees, 0, 0)
  })

  MeshRenderer.setBox(ramp)
  MeshCollider.setBox(ramp)

  Material.setPbrMaterial(ramp, {
    albedoColor: color
  })

  return ramp
}

/**
 * Creates a 3D text label that always faces the player
 */
export function createLabel(text: string, position: Vector3, fontSize: number = 2): Entity {
  const label = engine.addEntity()

  Transform.create(label, {
    position: position
  })

  TextShape.create(label, {
    text: text,
    fontSize: fontSize,
    textColor: Color4.White(),
    outlineWidth: 0.2,
    outlineColor: Color3.Black()
  })

  Billboard.create(label)

  return label
}

/**
 * Helper to get key name for an action
 */
export function getActionKey(action: InputAction): string {
  const info = INPUT_ACTIONS.find(a => a.action === action)
  return info ? info.key : 'Unknown'
}

/**
 * Helper to get color for an action
 */
export function getActionColor(action: InputAction): Color4 {
  const info = INPUT_ACTIONS.find(a => a.action === action)
  return info ? info.color : DEFAULT_COLOR
}

/**
 * Helper to get name for an action
 */
export function getActionName(action: InputAction): string {
  const info = INPUT_ACTIONS.find(a => a.action === action)
  return info ? info.name : 'UNKNOWN'
}

/**
 * Creates an input-responsive cube for control mapping test
 */
export function createInputCube(
  position: Vector3,
  scale: Vector3,
  actions: InputAction[],
  isMasterCube: boolean = false
): Entity {
  const cube = engine.addEntity()

  Transform.create(cube, {
    position: position,
    scale: scale
  })

  MeshRenderer.setBox(cube)
  MeshCollider.setBox(cube)

  Material.setPbrMaterial(cube, {
    albedoColor: DEFAULT_COLOR
  })

  CubeInputState.create(cube, {
    actions: actions,
    currentColor: -1,
    isPressed: false,
    isMasterCube: isMasterCube
  })

  HoverState.create(cube, {
    isHovered: false,
    lastAction: ''
  })

  const pointerEvents: any[] = []
  for (const action of actions) {
    pointerEvents.push(
      {
        eventType: PointerEventType.PET_DOWN,
        eventInfo: {
          button: action,
          hoverText: isMasterCube ? 'Press any key' : `Press ${getActionKey(action)}`
        }
      },
      {
        eventType: PointerEventType.PET_UP,
        eventInfo: {
          button: action,
          hoverText: ''
        }
      }
    )
  }

  PointerEvents.create(cube, {
    pointerEvents: pointerEvents
  })

  return cube
}

/**
 * Updates hover text dynamically based on state
 */
export function updateHoverText(
  entity: any,
  isMasterCube: boolean,
  actionName: string,
  isPressed: boolean
): void {
  const pointerEvents = PointerEvents.getMutable(entity as any)

  if (!pointerEvents || !pointerEvents.pointerEvents) return

  for (let i = 0; i < pointerEvents.pointerEvents.length; i++) {
    const event = pointerEvents.pointerEvents[i]

    if (event.eventType === PointerEventType.PET_DOWN && event.eventInfo) {
      if (isPressed) {
        event.eventInfo.hoverText = `Pressed: ${actionName}`
      } else {
        if (isMasterCube) {
          event.eventInfo.hoverText = 'Press any key'
        } else {
          const action = event.eventInfo.button
          if (action !== undefined) {
            event.eventInfo.hoverText = `Press ${getActionKey(action)}`
          }
        }
      }
    }
  }
}
