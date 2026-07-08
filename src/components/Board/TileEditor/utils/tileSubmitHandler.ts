import { UserData } from '../../../../types/app';
import { Tile } from '../../../../types/board';

interface ImageUploadData {
  isUploaded: boolean;
  fileName: string;
  blob: Blob;
}

export async function handleTileSubmit(
  isEditing: boolean,
  tiles: Tile[],
  tile: Tile,
  imageUploadedData: ImageUploadData[],
  selectedBackgroundColor: string,
  updateTileImgURL: (
    blob: Blob,
    fileName: string,
    userData?: UserData,
  ) => Promise<string>,
  userData: UserData | undefined,
  onEditSubmit: (tiles: Tile[]) => void | Promise<void>,
  onAddSubmit: (tile: Tile) => void | Promise<void>,
): Promise<void> {
  if (isEditing) {
    if (imageUploadedData.length) {
      let tilesToAdd = JSON.parse(JSON.stringify(tiles)) as Tile[];
      await Promise.all(
        imageUploadedData.map(async (obj, index) => {
          if (obj.isUploaded) {
            tilesToAdd[index].image = await updateTileImgURL(
              obj.blob,
              obj.fileName,
              userData,
            );
          }
        }),
      );
      await Promise.resolve(onEditSubmit(tilesToAdd));
    } else {
      await Promise.resolve(onEditSubmit(tiles));
    }
  } else {
    const tileToAdd = { ...tile };
    const imageData = imageUploadedData[0];

    if (imageData && imageData.isUploaded) {
      tileToAdd.image = await updateTileImgURL(
        imageData.blob,
        imageData.fileName,
        userData,
      );
    }

    if (selectedBackgroundColor) {
      tileToAdd.backgroundColor = selectedBackgroundColor;
    }

    await Promise.resolve(onAddSubmit(tileToAdd));
  }
}
