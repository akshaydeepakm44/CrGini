import { copyStorageObject, deleteFile } from './storageService.js';

/**
 * Move a staged asset from the temporary client staging area
 * into the permanent showcase directory in Object Storage.
 *
 * Uses the unified Object Storage abstraction (`copyStorageObject` + `deleteFile`),
 * ensuring identical behavior across MinIO and LocalDiskStorageDriver.
 *
 * @param {Object} options
 * @param {string} options.clientId - Client ID owning the staged asset
 * @param {string} options.assetKey - Staged asset key (dzg_ast_<uuid>)
 * @param {string} options.targetPrefix - Target directory prefix (e.g. 'public-samples/slug/company-study')
 * @returns {Promise<string>} The permanent object key in storage
 */
export async function relocateStagedAsset({ clientId, assetKey, targetPrefix }) {
  if (!assetKey || !clientId || !targetPrefix) {
    throw new Error('clientId, assetKey, and targetPrefix are required to relocate a staged asset.');
  }

  const uuid = assetKey.replace(/^dzg_ast_/, '');
  const cleanTargetPrefix = String(targetPrefix).replace(/^\/+|\/+$/g, '');
  const oldObjectKey = `temp/${clientId}/${uuid}.pdf`;
  const newObjectKey = `${cleanTargetPrefix}/${uuid}.pdf`;

  // 1. Copy object via unified storage abstraction
  await copyStorageObject(oldObjectKey, newObjectKey);

  // 2. Remove old object from staging area
  await deleteFile(oldObjectKey);

  return newObjectKey;
}
