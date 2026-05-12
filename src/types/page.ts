import type { AccessControl } from './cms'

export interface BlockNode {
  type: string
  id: string
  props?: Record<string, unknown>
  children?: BlockNode[]
  symbolId?: string
  overrides?: Record<string, unknown>
  cmsBindings?: Record<string, string>
  interactions?: Interaction[]
  accessControl?: AccessControl
}

export interface PageModel {
  version: 1
  root: BlockNode
}

export type InteractionTrigger =
  | 'page-load'
  | 'scroll-into-view'
  | 'scroll-out-of-view'
  | 'mouse-enter'
  | 'mouse-leave'
  | 'click'
  | 'scroll'

export type InteractionActionType =
  | 'move'
  | 'scale'
  | 'rotate'
  | 'opacity'
  | 'bg-color'
  | 'blur'
  | 'border-color'

export interface InteractionAction {
  type: InteractionActionType
  duration: number
  delay: number
  easing: string
  from?: Record<string, number | string>
  to: Record<string, number | string>
}

export interface Interaction {
  id: string
  trigger: InteractionTrigger
  actions: InteractionAction[]
}
