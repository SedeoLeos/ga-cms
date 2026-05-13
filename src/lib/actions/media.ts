'use server'

import { prisma } from '@/lib/db/client'
import { localDelete } from '@/lib/storage/local'
import { revalidatePath } from 'next/cache'

export async function deleteMediaFileAction(fileId: string): Promise<void> {
  const file = await prisma.mediaFile.findUnique({ where: { id: fileId }, select: { url: true } })
  if (!file) return
  await localDelete(file.url)
  await prisma.mediaFile.delete({ where: { id: fileId } })
  revalidatePath('/admin/media')
}

export async function updateMediaFileMetaAction(
  fileId: string,
  alt: string,
  caption: string,
): Promise<{ error?: string }> {
  await prisma.mediaFile.update({
    where: { id: fileId },
    data: {
      alt: alt.trim() || null,
      caption: caption.trim() || null,
    },
  })
  revalidatePath('/admin/media')
  return {}
}

export async function createMediaFolderAction(name: string): Promise<{ error?: string }> {
  const trimmed = name.trim()
  if (!trimmed) return { error: 'Nom requis' }
  await prisma.mediaFolder.create({ data: { name: trimmed } })
  revalidatePath('/admin/media')
  return {}
}

export async function deleteMediaFolderAction(folderId: string): Promise<void> {
  await prisma.mediaFile.updateMany({ where: { folderId }, data: { folderId: null } })
  await prisma.mediaFolder.delete({ where: { id: folderId } })
  revalidatePath('/admin/media')
}
