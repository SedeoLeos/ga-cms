import { resendEmailPlugin } from './built-in/email/resend'
import { puckPlugin } from './built-in/puck'
import { supabaseStoragePlugin } from './built-in/storage/supabase'
import { uploadthingPlugin } from './built-in/storage/uploadthing'
import { pluginRegistry } from './registry'

export function registerBuiltInPlugins() {
  pluginRegistry.register(puckPlugin)
  pluginRegistry.register(uploadthingPlugin)
  pluginRegistry.register(supabaseStoragePlugin)
  pluginRegistry.register(resendEmailPlugin)
}

export { pluginRegistry }
export * from './types'
