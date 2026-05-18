import { Buffer } from "node:buffer"
import { randomUUID } from "node:crypto"
import type { SupabaseClient } from "@supabase/supabase-js"

const DEFAULT_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "uploads"
const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/s

type DataUrlPayload = {
  mimeType: string
  bytes: Uint8Array
  extension: string
}

function getExtensionForMimeType(mimeType: string) {
  switch (mimeType.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    case "image/svg+xml":
      return "svg"
    case "application/pdf":
      return "pdf"
    default: {
      const [, subtype = "bin"] = mimeType.toLowerCase().split("/")
      return subtype.replace(/[^a-z0-9]+/g, "") || "bin"
    }
  }
}

function parseDataUrl(value: string): DataUrlPayload | null {
  const match = DATA_URL_PATTERN.exec(value)

  if (!match) {
    return null
  }

  const [, mimeType, base64] = match

  return {
    mimeType,
    bytes: Buffer.from(base64, "base64"),
    extension: getExtensionForMimeType(mimeType),
  }
}

async function ensurePublicBucket(client: SupabaseClient, bucketName: string) {
  const { data, error } = await client.storage.getBucket(bucketName)

  if (data?.public === true) {
    return
  }

  if (data && data.public === false) {
    const { error: updateError } = await client.storage.updateBucket(bucketName, { public: true })

    if (updateError) {
      throw updateError
    }

    return
  }

  if (error || !data) {
    const { error: createError } = await client.storage.createBucket(bucketName, { public: true })

    if (createError && !/already exists/i.test(createError.message)) {
      throw createError
    }
  }
}

function buildStoragePath(pathPrefix: string, extension: string) {
  const cleanedPrefix = pathPrefix.replace(/^\/+|\/+$/g, "")
  return `${cleanedPrefix}/${randomUUID()}.${extension}`
}

async function uploadDataUrl(client: SupabaseClient, bucketName: string, pathPrefix: string, value: string) {
  const parsed = parseDataUrl(value)

  if (!parsed) {
    return value
  }

  await ensurePublicBucket(client, bucketName)

  const storagePath = buildStoragePath(pathPrefix, parsed.extension)
  const storage = client.storage.from(bucketName)

  const { error: uploadError } = await storage.upload(storagePath, parsed.bytes, {
    contentType: parsed.mimeType,
    upsert: true,
  })

  if (uploadError) {
    if (/bucket.*not found|not found/i.test(uploadError.message)) {
      await ensurePublicBucket(client, bucketName)

      const { error: retryError } = await storage.upload(storagePath, parsed.bytes, {
        contentType: parsed.mimeType,
        upsert: true,
      })

      if (retryError) {
        throw retryError
      }
    } else {
      throw uploadError
    }
  }

  return storage.getPublicUrl(storagePath).data.publicUrl
}

export async function persistDataUrlAsPublicUrl(
  client: SupabaseClient,
  value: string | null | undefined,
  pathPrefix: string,
  bucketName = DEFAULT_STORAGE_BUCKET,
) {
  if (value == null) {
    return null
  }

  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  if (!trimmedValue.startsWith("data:")) {
    return trimmedValue
  }

  return uploadDataUrl(client, bucketName, pathPrefix, trimmedValue)
}