/**
 * Instant Storage Helper Utilities
 * =================================
 * Provides file upload and linking functions using Instant Storage (`db.storage.uploadFile`).
 *
 * CRITICAL STORAGE RULES (from instantDBagentfile.md):
 * - Uploads auto-create `$files` entities with path and url.
 * - `$files` entities can ONLY be created via `db.storage.uploadFile`.
 * - Link returned `$files` entity ID to your data models via schema links.
 */

import { db } from "@/lib/instant";

export interface UploadResult {
  fileId: string;
  url: string;
}

/**
 * Upload a file to Instant Storage and return the file ID and public URL.
 *
 * @param path - Storage path, e.g., `markets/${marketId}/${file.name}`
 * @param file - File object from browser input
 */
export async function uploadInstantFile(
  path: string,
  file: File
): Promise<UploadResult> {
  const { data } = await db.storage.uploadFile(path, file);
  const fileId = data?.id || "";
  const url =
    (data as any)?.url ||
    (data as any)?.downloadUrl ||
    (fileId ? `https://api.instantdb.com/storage/files/${fileId}` : "");

  return {
    fileId,
    url,
  };
}

/**
 * Upload a market thumbnail and link it to a market entity.
 */
export async function uploadMarketImage(
  marketId: string,
  file: File
): Promise<UploadResult> {
  const storagePath = `markets/${marketId}/${Date.now()}_${file.name}`;
  const result = await uploadInstantFile(storagePath, file);
  return result;
}

/**
 * Upload a contestant avatar image for 1v1 or multi-option markets.
 */
export async function uploadOptionAvatar(
  optionId: string,
  file: File
): Promise<UploadResult> {
  const storagePath = `options/${optionId}/${Date.now()}_${file.name}`;
  const result = await uploadInstantFile(storagePath, file);
  return result;
}
