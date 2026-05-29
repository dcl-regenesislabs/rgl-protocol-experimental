import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { ui } from './ui'

export function main(): void {
  console.log('[UI Border Test] Initialized (pure UI scene)')
  ReactEcsRenderer.setUiRenderer(ui)
}
