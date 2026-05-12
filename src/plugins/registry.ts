import type { PluginBlockDefinition, StorageAdapter, TatomirPlugin } from './types'

class PluginRegistry {
  private plugins = new Map<string, TatomirPlugin>()

  register(plugin: TatomirPlugin, config: Record<string, unknown> = {}) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[plugins] Plugin "${plugin.id}" already registered — skipping`)
      return
    }
    this.plugins.set(plugin.id, plugin)
    plugin.onInit?.(config)
  }

  get(id: string): TatomirPlugin | undefined {
    return this.plugins.get(id)
  }

  getAll(): TatomirPlugin[] {
    return Array.from(this.plugins.values())
  }

  getAllBlocks(): PluginBlockDefinition[] {
    return this.getAll().flatMap((p) => p.blocks ?? [])
  }

  getStorageAdapter(id: string): StorageAdapter | undefined {
    for (const plugin of this.plugins.values()) {
      const adapter = plugin.storageAdapters?.find((a) => a.id === id)
      if (adapter) return adapter
    }
    return undefined
  }

  getActiveStorageAdapter(): StorageAdapter | undefined {
    const provider = process.env.STORAGE_PROVIDER ?? 'uploadthing'
    return this.getStorageAdapter(provider)
  }
}

// Singleton — safe for Next.js hot reload
const globalRegistry = globalThis as unknown as { __tatomirPlugins?: PluginRegistry }
export const pluginRegistry = globalRegistry.__tatomirPlugins ?? new PluginRegistry()
if (process.env.NODE_ENV !== 'production') {
  globalRegistry.__tatomirPlugins = pluginRegistry
}
