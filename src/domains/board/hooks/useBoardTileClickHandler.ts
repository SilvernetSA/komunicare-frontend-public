import { Dispatch, SetStateAction, useCallback } from 'react';
import { IntlShape } from 'react-intl';
import { NavigateFunction } from 'react-router-dom';

import { ensureBoardLoadedAndActivate } from './useBoardRouteLifecycle/useBoardRouteLifecycle.activation';
import messages from '../components/Messages/Board.messages';

import { useAppStore } from '@/domains/app/stores/appStore';
import { speak } from '@/domains/shared/providers/SpeechProvider/speechService';
import { Board as BoardModel, Tile } from '@/types/board';

interface UseBoardTileClickHandlerParams {
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

async function playAudio(src: string): Promise<void> {
  try {
    const audio = new Audio(src);
    await audio.play();
  } catch (error) {
    console.error('[playAudio] Failed to play audio:', src, error);
  }
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

export const useBoardTileClickHandler = ({
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
}: UseBoardTileClickHandlerParams) =>
  useCallback(
    (tile: Tile) => {
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
    },
    [
      boards,
      changeBoard,
      changeOutput,
      fetchBoardById,
      intl,
      isSelecting,
      navigate,
      output,
      setSelectedTileIds,
      showNotification,
    ],
  );
