import { Dispatch, SetStateAction } from 'react';
import { IntlShape } from 'react-intl';
import { NavigateFunction } from 'react-router-dom';

import { speak } from '../../../../providers/SpeechProvider/speechService';
import { useAppStore } from '../../../../store/appStore';
import { Board as BoardModel, Tile } from '../../../../types/board';
import messages from '../../Board.messages';
import { playAudio } from '../../utils-simple/playAudio';
import { ensureBoardLoadedAndActivate } from '../navigationHelpers';

interface HandleTileClickParams {
  tile: Tile;
  isSelecting: boolean;
  setSelectedTileIds: Dispatch<SetStateAction<string[]>>;
  boards: BoardModel[];
  changeBoard: (id: string) => void;
  navigate: NavigateFunction;
  fetchBoardById: (id: string) => Promise<BoardModel | undefined>;
  showNotification: (message: string) => void;
  intl: IntlShape;
  output: Tile[];
  changeOutput: (output: Tile[]) => void;
}

const getTileSpeechText = (tile: Tile) => {
  const text = tile.vocalization || tile.label || '';
  return text.trim();
};

const vocalizeTile = ({
  tile,
  suppressDerivedText = false,
}: {
  tile: Tile;
  suppressDerivedText?: boolean;
}) => {
  if (tile.sound) {
    void playAudio(tile.sound);
    return;
  }

  if (suppressDerivedText) {
    return;
  }

  const speechText = getTileSpeechText(tile);
  if (speechText) {
    speak(speechText);
  }
};

/**
 * Handles tile click behavior for selection, board navigation and output composition.
 */
export const handleTileClick = ({
  tile,
  isSelecting,
  setSelectedTileIds,
  boards,
  changeBoard,
  navigate,
  fetchBoardById,
  showNotification,
  intl,
  output,
  changeOutput,
}: HandleTileClickParams) => {
  const { vocalizeFolders = false, playSoundOnTouchActive = false } =
    useAppStore.getState().navigationSettings || {};

  if (isSelecting) {
    setSelectedTileIds((prev) =>
      prev.includes(tile.id)
        ? prev.filter((id) => id !== tile.id)
        : [...prev, tile.id],
    );
    return;
  }

  if (tile.loadBoard) {
    if (vocalizeFolders) {
      vocalizeTile({ tile });
    }

    void ensureBoardLoadedAndActivate({
      boardId: tile.loadBoard,
      availableBoards: boards,
      fetchBoardById,
      changeBoard,
      navigation: { navigate },
    }).catch(() => {
      showNotification(intl.formatMessage(messages.boardMissed));
    });
    return;
  }

  if (playSoundOnTouchActive) {
    vocalizeTile({
      tile,
      suppressDerivedText: tile.action?.startsWith('+'),
    });
  }

  changeOutput([...output, tile]);
};
