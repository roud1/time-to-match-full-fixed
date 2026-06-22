/**
 * Photo storage — S3-compatible (AWS S3, Cloudflare R2).
 * Returns null when env is not configured (demo/base64 fallback on client).
 */

export type PresignedUpload = {
  uploadUrl: string
  publicUrl: string
  key: string
}

export interface PhotoStorageAdapter {
  createPresignedUpload(userId: string, contentType: string): Promise<PresignedUpload | null>
  isConfigured(): boolean
}

export class UnconfiguredPhotoStorage implements PhotoStorageAdapter {
  isConfigured(): boolean {
    return false
  }

  async createPresignedUpload(): Promise<PresignedUpload | null> {
    return null
  }
}

type S3Config = {
  bucket: string
  region: string
  accessKey: string
  secretKey: string
  endpoint?: string
  publicBaseUrl?: string
}

function readS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim() || process.env.AWS_S3_BUCKET?.trim()
  const region = process.env.S3_REGION?.trim() || process.env.AWS_REGION?.trim() || "auto"
  const accessKey =
    process.env.S3_ACCESS_KEY?.trim() || process.env.AWS_ACCESS_KEY_ID?.trim()
  const secretKey =
    process.env.S3_SECRET_KEY?.trim() || process.env.AWS_SECRET_ACCESS_KEY?.trim()
  const endpoint = process.env.S3_ENDPOINT?.trim() || process.env.AWS_S3_ENDPOINT?.trim()
  const publicBaseUrl =
    process.env.S3_PUBLIC_URL?.trim() || process.env.AWS_S3_PUBLIC_URL?.trim()

  if (!bucket || !accessKey || !secretKey) return null

  return { bucket, region, accessKey, secretKey, endpoint, publicBaseUrl }
}

function extensionForContentType(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  }
  return map[contentType.toLowerCase()] ?? "jpg"
}

function publicUrlForKey(config: S3Config, key: string): string {
  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl.replace(/\/$/, "")}/${key}`
  }
  if (config.endpoint) {
    const base = config.endpoint.replace(/\/$/, "")
    return `${base}/${config.bucket}/${key}`
  }
  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`
}

export class S3PhotoStorage implements PhotoStorageAdapter {
  private config: S3Config

  constructor(config: S3Config) {
    this.config = config
  }

  isConfigured(): boolean {
    return true
  }

  async createPresignedUpload(
    userId: string,
    contentType: string
  ): Promise<PresignedUpload | null> {
    const ext = extensionForContentType(contentType)
    const key = `users/${userId}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner")

    const client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey,
      },
      forcePathStyle: Boolean(this.config.endpoint),
    })

    const command = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 })

    return {
      uploadUrl,
      publicUrl: publicUrlForKey(this.config, key),
      key,
    }
  }
}

let cached: PhotoStorageAdapter | null = null

export function getPhotoStorage(): PhotoStorageAdapter {
  if (cached) return cached
  const config = readS3Config()
  cached = config ? new S3PhotoStorage(config) : new UnconfiguredPhotoStorage()
  return cached
}

export function isPhotoStorageConfigured(): boolean {
  return getPhotoStorage().isConfigured()
}
