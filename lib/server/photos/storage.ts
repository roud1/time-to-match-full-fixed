/**
 * Photo storage adapter stub — implement S3/R2 presigned uploads post-P1.
 * See README "Post-P1" section for planned integration.
 */
export type PresignedUpload = {
  uploadUrl: string
  publicUrl: string
  key: string
}

export interface PhotoStorageAdapter {
  createPresignedUpload(userId: string, contentType: string): Promise<PresignedUpload | null>
}

export class UnconfiguredPhotoStorage implements PhotoStorageAdapter {
  async createPresignedUpload(): Promise<PresignedUpload | null> {
    return null
  }
}

export function getPhotoStorage(): PhotoStorageAdapter {
  // Future: return S3/R2 adapter when AWS_* or R2_* env vars are set
  return new UnconfiguredPhotoStorage()
}
