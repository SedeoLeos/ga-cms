import type { TatomirPlugin } from '../../types'

function getClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  return import('@supabase/supabase-js').then(({ createClient }) => createClient(url, key))
}

export const supabaseStoragePlugin: TatomirPlugin = {
  id: 'storage-supabase',
  name: 'Supabase Storage',
  version: '1.0.0',
  description: 'Media storage via Supabase Storage — best when using Supabase as DB',
  storageAdapters: [
    {
      id: 'supabase',
      async upload(file, filename, mimeType) {
        const supabase = await getClient()
        const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'media'
        const path = `${Date.now()}-${filename}`
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: mimeType })
        if (error) throw error
        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        return data.publicUrl
      },
      async delete(url) {
        const supabase = await getClient()
        const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'media'
        const path = url.split(`${bucket}/`)[1]
        if (path) await supabase.storage.from(bucket).remove([path])
      },
      async getSignedUrl(url, expiresIn) {
        const supabase = await getClient()
        const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'media'
        const path = url.split(`${bucket}/`)[1] ?? ''
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
        if (error || !data) throw error ?? new Error('No signed URL returned')
        return data.signedUrl
      },
    },
  ],
}
