import { StorageService } from '../src/storage/storage.service'

describe('StorageService', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('returns direct mode for local signed upload', async () => {
    process.env.STORAGE_PROVIDER = 'local'
    const storage = new StorageService()
    const result = await storage.createUploadSignedUrl('materials', 'note.pdf', 'application/pdf')

    expect(result.mode).toBe('direct')
    expect(result.provider).toBe('local')
    expect(result.fileUrl).toMatch(/^\/uploads\/materials\//)
    expect(result.uploadUrl).toBeNull()
  })

  it('returns public local download url', async () => {
    process.env.STORAGE_PROVIDER = 'local'
    const storage = new StorageService()
    const result = await storage.createDownloadSignedUrl('/uploads/materials/demo.pdf')

    expect(result.mode).toBe('public')
    expect(result.downloadUrl).toBe('/uploads/materials/demo.pdf')
    expect(result.key).toBe('materials/demo.pdf')
  })
})
