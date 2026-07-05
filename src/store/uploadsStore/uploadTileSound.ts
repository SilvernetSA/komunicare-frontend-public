import { UserData } from '../../types/app';
import { Tile } from '../../types/board';
import { useUploadsStore } from '../uploadsStore';

/**
 * Upload a tile sound
 * @param tile The tile with sound to upload
 * @param userData User data for the upload
 * @returns Promise with the updated tile
 */
export async function uploadTileSound(
  tile: Tile,
  userData: UserData,
): Promise<Tile> {
  if (tile && tile.sound && tile.sound.startsWith('data')) {
    try {
      const blob = new Blob([convertDataURIToBinary(tile.sound)], {
        type: 'audio/ogg; codecs=opus',
      });
      tile.sound = await useUploadsStore
        .getState()
        .uploadFile(blob, `${userData.email}.ogg`);
    } catch (err) {
      console.error('Error uploading tile sound:', err);
    }
  }
  return tile;
}

function convertDataURIToBinary(dataURI: string): Uint8Array {
  const BASE64_MARKER = ';base64,';
  const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  const base64 = dataURI.substring(base64Index);
  const raw = window.atob(base64);
  const rawLength = raw.length;
  const array = new Uint8Array(new ArrayBuffer(rawLength));

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}
