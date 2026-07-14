import { useEffect, useRef } from 'react';
import { useIntl, IntlShape } from 'react-intl';

import { useAppStore } from '../../../../../store/appStore';
import { useBoardsStore } from '../../../../../store/boardsStore';
import { useGptStore } from '../../../../../store/gptStore';
import { useLanguageStore } from '../../../../../store/languageStore';

import type { Tile } from '../../../../../types/board';

// Same text the output bar speaks: translated labelKey, then vocalization or
// label, joined and collapsed. Works for pictogram tiles and the keyboard's
// live tile alike.
export const getOutputText = (output: Tile[], intl: IntlShape): string =>
  output
    .map((tile) => {
      const label =
        tile.labelKey &&
        (intl.messages as Record<string, string>)?.[tile.labelKey]
          ? intl.formatMessage({ id: tile.labelKey })
          : typeof tile.label === 'string'
            ? tile.label
            : '';
      const value = tile.vocalization || label;
      if (typeof value === 'string') return value;
      if (typeof value === 'number') return String(value);
      return '';
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Debounced GPT "improve phrase" suggestion driven by the current output.
 *
 * Lives in an always-mounted component (BoardHeader) instead of the output
 * bar, so the suggestion keeps updating in on-screen-keyboard mode too — the
 * output bar unmounts there, which used to silently disconnect this feature.
 */
export const useImprovePhrase = (): void => {
  const intl = useIntl();
  const output = useBoardsStore((state) => state.output);
  const navigationSettings = useAppStore((state) => state.navigationSettings);
  const language = useLanguageStore((state) => state.lang);
  const improvePhrase = useGptStore((state) => state.improvePhrase);
  const abortImprovePhrase = useGptStore((state) => state.abortImprovePhrase);
  const changeImprovedPhrase = useBoardsStore(
    (state) => state.changeImprovedPhrase,
  );
  const requestCounterRef = useRef(0);

  const phrase = getOutputText(output as Tile[], intl);

  useEffect(() => {
    const improvePhraseEnabled =
      (navigationSettings as { improvePhraseActive?: boolean })
        .improvePhraseActive !== false;
    if (!improvePhraseEnabled || !phrase) {
      abortImprovePhrase();
      changeImprovedPhrase('');
      return;
    }

    const currentRequest = ++requestCounterRef.current;
    const timeoutId = window.setTimeout(async () => {
      const nextImprovedPhrase = await improvePhrase({ phrase, language });
      if (requestCounterRef.current !== currentRequest) return;
      changeImprovedPhrase(nextImprovedPhrase || '');
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      abortImprovePhrase();
    };
  }, [
    phrase,
    navigationSettings,
    language,
    improvePhrase,
    abortImprovePhrase,
    changeImprovedPhrase,
  ]);
};
