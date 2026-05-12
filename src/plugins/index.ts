import { resendEmailPlugin } from './built-in/email/resend'
import { grapesjsPlugin } from './built-in/grapesjs'
import { supabaseStoragePlugin } from './built-in/storage/supabase'
import { uploadthingPlugin } from './built-in/storage/uploadthing'
import { pluginRegistry } from './registry'

export function registerBuiltInPlugins() {
  pluginRegistry.register(grapesjsPlugin)
  pluginRegistry.register(uploadthingPlugin)
  pluginRegistry.register(supabaseStoragePlugin)
  pluginRegistry.register(resendEmailPlugin)
}

export { pluginRegistry }
export * from './types'
