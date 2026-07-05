import { isAllowedImageUpload } from '../src/common/utils/file-upload'

describe('isAllowedImageUpload', () => {
  it('accepts common image uploads for course thumbnails', () => {
    const file = {
      originalname: 'cover.png',
      mimetype: 'image/png',
    } as Express.Multer.File

    expect(isAllowedImageUpload(file)).toBe(true)
  })

  it('rejects non-image files', () => {
    const file = {
      originalname: 'notes.pdf',
      mimetype: 'application/pdf',
    } as Express.Multer.File

    expect(isAllowedImageUpload(file)).toBe(false)
  })
})
