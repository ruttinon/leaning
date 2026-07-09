import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { buildUploadFilename } from '../common/utils/file-upload'

@Injectable()
export class StorageService {
  private readonly provider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase()
  private readonly localUploadRoot = join(process.cwd(), 'uploads')
  private readonly s3Bucket = process.env.S3_BUCKET || ''
  private readonly s3Region = process.env.S3_REGION || 'ap-southeast-1'
  private readonly s3Endpoint = process.env.S3_ENDPOINT || ''
  private readonly s3PublicUrl = process.env.S3_PUBLIC_URL || ''
  private readonly s3ForcePathStyle = (process.env.S3_FORCE_PATH_STYLE || 'false') === 'true'
  private readonly signedUrlExpiresIn = Number(process.env.S3_SIGNED_URL_EXPIRES_IN || 900)
  private readonly s3Client =
    this.provider === 's3'
      ? new S3Client({
          region: this.s3Region,
          endpoint: this.s3Endpoint || undefined,
          credentials:
            process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
              ? {
                  accessKeyId: process.env.S3_ACCESS_KEY_ID,
                  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                }
              : undefined,
          forcePathStyle: this.s3ForcePathStyle,
        })
      : null

  getProvider() {
    return this.provider === 's3' ? 's3' : 'local'
  }

  async uploadMulterFile(file: Express.Multer.File, folder: string) {
    if (!file) {
      throw new InternalServerErrorException('Upload file is missing')
    }
    return this.uploadBuffer(file.buffer, file.mimetype, file.originalname, folder)
  }

  async uploadBuffer(buffer: Buffer, mimeType: string, originalName: string, folder: string) {
    const filename = buildUploadFilename(originalName)
    const key = this.buildObjectKey(folder, filename)

    if (this.provider === 's3') {
      await this.uploadToS3(buffer, key, mimeType)
      return this.buildS3PublicUrl(key)
    }

    await this.uploadToLocal(buffer, key)
    return `/uploads/${key}`
  }

  async createUploadSignedUrl(folder: string, originalName: string, contentType: string) {
    const filename = buildUploadFilename(originalName || 'file.bin')
    const key = this.buildObjectKey(folder, filename)
    const fileUrl = this.provider === 's3' ? this.buildS3PublicUrl(key) : `/uploads/${key}`

    if (this.provider !== 's3') {
      return {
        mode: 'direct' as const,
        provider: 'local' as const,
        key,
        fileUrl,
        uploadUrl: null,
        expiresIn: null,
        message: 'Local storage uses direct multipart upload via API endpoints',
      }
    }

    if (!this.s3Client || !this.s3Bucket) {
      throw new InternalServerErrorException('S3 storage is not configured correctly')
    }

    const command = new PutObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    })
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.signedUrlExpiresIn,
    })

    return {
      mode: 'signed' as const,
      provider: 's3' as const,
      key,
      fileUrl,
      uploadUrl,
      expiresIn: this.signedUrlExpiresIn,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
    }
  }

  async createDownloadSignedUrl(fileUrl: string) {
    if (!fileUrl) {
      throw new BadRequestException('fileUrl is required')
    }

    const key = this.extractKeyFromUrl(fileUrl)
    if (!key) {
      throw new BadRequestException('Unable to resolve storage key from fileUrl')
    }

    if (this.provider !== 's3') {
      return {
        mode: 'public' as const,
        provider: 'local' as const,
        key,
        downloadUrl: fileUrl.startsWith('/') ? fileUrl : `/uploads/${key}`,
        expiresIn: null,
      }
    }

    if (!this.s3Client || !this.s3Bucket) {
      throw new InternalServerErrorException('S3 storage is not configured correctly')
    }

    const command = new GetObjectCommand({
      Bucket: this.s3Bucket,
      Key: key,
    })
    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.signedUrlExpiresIn,
    })

    return {
      mode: 'signed' as const,
      provider: 's3' as const,
      key,
      downloadUrl,
      expiresIn: this.signedUrlExpiresIn,
    }
  }

  async deleteByFileUrl(fileUrl?: string | null) {
    if (!fileUrl) return false

    const key = this.extractKeyFromUrl(fileUrl)
    if (!key) return false

    if (this.provider === 's3') {
      await this.deleteFromS3(key)
      return true
    }

    await this.deleteFromLocal(key)
    return true
  }

  private buildObjectKey(folder: string, filename: string) {
    const normalizedFolder = folder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
    return normalizedFolder ? `${normalizedFolder}/${filename}` : filename
  }

  private async uploadToLocal(buffer: Buffer, key: string) {
    const outputPath = join(this.localUploadRoot, key)
    await mkdir(dirname(outputPath), { recursive: true })
    await writeFile(outputPath, buffer)
  }

  private async uploadToS3(buffer: Buffer, key: string, mimeType: string) {
    if (!this.s3Client || !this.s3Bucket) {
      throw new InternalServerErrorException('S3 storage is not configured correctly')
    }

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType || 'application/octet-stream',
      }),
    )
  }

  private async deleteFromLocal(key: string) {
    try {
      await unlink(join(this.localUploadRoot, key))
    } catch {
      // File may already be missing; treat as success for delete flows.
    }
  }

  private async deleteFromS3(key: string) {
    if (!this.s3Client || !this.s3Bucket) {
      throw new InternalServerErrorException('S3 storage is not configured correctly')
    }

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: key,
      }),
    )
  }

  private extractKeyFromUrl(fileUrl: string) {
    const value = fileUrl.trim()
    if (!value) return null

    if (value.startsWith('/uploads/')) {
      return value.replace(/^\/uploads\//, '')
    }

    try {
      const parsed = new URL(value)
      const pathname = decodeURIComponent(parsed.pathname.replace(/^\/+/, ''))

      if (this.s3PublicUrl) {
        const publicPath = new URL(this.s3PublicUrl).pathname.replace(/^\/+|\/+$/g, '')
        if (publicPath && pathname.startsWith(`${publicPath}/`)) {
          return pathname.slice(publicPath.length + 1)
        }
      }

      if (this.s3Bucket && pathname.startsWith(`${this.s3Bucket}/`)) {
        return pathname.slice(this.s3Bucket.length + 1)
      }

      return pathname || null
    } catch {
      return value.replace(/^uploads\//, '')
    }
  }

  private buildS3PublicUrl(key: string) {
    if (this.s3PublicUrl) {
      return `${this.s3PublicUrl.replace(/\/+$/g, '')}/${key}`
    }
    if (this.s3Endpoint) {
      return `${this.s3Endpoint.replace(/\/+$/g, '')}/${this.s3Bucket}/${key}`
    }
    return `https://${this.s3Bucket}.s3.${this.s3Region}.amazonaws.com/${key}`
  }
}
