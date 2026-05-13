import fs from 'node:fs/promises'
import path from 'node:path'

export async function localUpload(file: Buffer, originalName: string): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(dir, { recursive: true })
  const ext = path.extname(originalName)
  const base = path
    .basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .slice(0, 80)
  const filename = `${Date.now()}-${base}${ext}`
  await fs.writeFile(path.join(dir, filename), file)
  return `/uploads/${filename}`
}

export async function localDelete(url: string): Promise<void> {
  try {
    const rel = url.replace(/^\//, '')
    await fs.unlink(path.join(process.cwd(), 'public', rel))
  } catch {
    // ignore missing files
  }
}
