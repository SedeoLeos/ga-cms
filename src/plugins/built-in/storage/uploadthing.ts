import type { TatomirPlugin } from '../../types'

export const uploadthingPlugin: TatomirPlugin = {
  id: 'storage-uploadthing',
  name: 'Uploadthing Storage',
  version: '1.0.0',
  description: 'Media storage via Uploadthing — works on Vercel and any Node.js host',
  storageAdapters: [
    {
      id: 'uploadthing',
      async upload(file, filename, mimeType) {
        // Lazy import — not loaded if this adapter is not active
        const { UTApi } = await import('uploadthing/server')
        const utapi = new UTApi()
        const blob = new Blob([new Uint8Array(file)], { type: mimeType })
        const uploadFile = new File([blob], filename, { type: mimeType })
        const res = await utapi.uploadFiles(uploadFile)
        if (res.error) throw new Error(res.error.message)
        return res.data.url
      },
      async delete(url) {
        const { UTApi } = await import('uploadthing/server')
        const utapi = new UTApi()
        const key = url.split('/').pop()
        if (key) await utapi.deleteFiles(key)
      },
    },
  ],
}
