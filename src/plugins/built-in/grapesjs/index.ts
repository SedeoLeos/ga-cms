import type { TatomirPlugin } from '../../types'

export const grapesjsPlugin: TatomirPlugin = {
  id: 'editor-grapesjs',
  name: 'GrapesJS Editor',
  version: '1.0.0',
  description:
    'Visual editor engine powered by GrapesJS (BSD-3). Custom React shell — GrapesJS UI never rendered.',
  onInit(config) {
    const defaults: Record<string, unknown> = {
      storageManager: false,
      undoManager: { trackChanges: true },
      selectorManager: { escapeName: (name: string) => name },
      styleManager: { clearProperties: true },
      panels: { defaults: [] },
      ...config,
    }
    ;(globalThis as Record<string, unknown>).__tatomirGjsDefaults = defaults
  },
}
