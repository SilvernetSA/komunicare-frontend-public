import BackspaceIcon from '@mui/icons-material/Backspace';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import classNames from 'classnames';
import isMobile from 'ismobilejs';
import queryString from 'query-string';
import React, { useState, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import { injectIntl, IntlShape, WrappedComponentProps } from 'react-intl';

import messages from './SymbolSearch.messages';
import { ARASAAC_BASE_PATH_API } from '@/constants';
import { arasaacDB } from '@/idb/arasaac/arasaacdb';
import { useArasaacStore } from '@/domains/board/stores/arasaacStore';
import { useGlobalSymbolsStore } from '@/domains/board/stores/globalSymbolsStore';
import { LABEL_POSITION_BELOW } from '@/domains/settings/components/Settings/Display/Display.constants';
import FilterBar from '@/domains/shared/components/UI/FilterBar/FilterBar';
import FullScreenDialog from '@/domains/shared/components/UI/FullScreenDialog/FullScreenDialog';
import Symbol from '../Symbol/Symbol';
import './SymbolSearch.css';

interface SymbolOption {
  id: string;
  text: string;
  enabled: boolean;
}

interface SymbolData {
  id: string;
  src: string;
  translatedId: string;
  keyPath?: string;
  fromArasaac?: boolean;
  fromGlobalsymbols?: boolean;
}

interface SymbolSearchProps {
  open: boolean;
  autoFill: string;
  maxSuggestions?: number;
  onChange: (data: {
    image: string;
    keyPath?: string;
    label: string;
    labelKey?: string;
  }) => Promise<void>;
  onClose: () => void;
}

type SymbolSearchPropsWithIntl = SymbolSearchProps & WrappedComponentProps;

const SymbolSets = {
  mulberry: '0',
  global: '1',
  arasaac: '2',
};

const symbolSetsOptions: SymbolOption[] = [
  {
    id: SymbolSets.mulberry,
    text: 'Mulberry',
    enabled: false,
  },
  {
    id: SymbolSets.global,
    text: 'Global Symbols',
    enabled: false,
  },
  {
    id: SymbolSets.arasaac,
    text: 'ARASAAC',
    enabled: true,
  },
];

const getFallbackTranslation = (key: string): string => {
  const lastSegment = key.split('.').pop() || key;

  return lastSegment
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
};

const getTranslatedSymbolId = (
  intlInstance: IntlShape | undefined,
  key: string,
): string => {
  if (!intlInstance) {
    return getFallbackTranslation(key);
  }

  const loadedMessages = (
    intlInstance as IntlShape & {
      messages?: Record<string, string>;
    }
  ).messages;

  if (!loadedMessages?.[key]) {
    return getFallbackTranslation(key);
  }

  return intlInstance.formatMessage({ id: key });
};

const SymbolSearch: React.FC<SymbolSearchPropsWithIntl> = ({
  open,
  autoFill = '',
  maxSuggestions = 16,
  onChange,
  onClose,
  intl,
}) => {
  const [openMirror, setOpenMirror] = useState(false);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<SymbolData[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [skin, _setSkin] = useState('white');
  const [hair, _setHair] = useState('brown');
  const [symbolSets, setSymbolSets] =
    useState<SymbolOption[]>(symbolSetsOptions);
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const requestIdRef = React.useRef(0);
  const intlRef = React.useRef(intl);

  useEffect(() => {
    intlRef.current = intl;
  }, [intl]);

  useEffect(() => {
    let cancelled = false;

    const loadSymbols = async () => {
      const { default: mulberrySymbols } = await import(
        '@/domains/board/stores/boardsCatalog/mulberry-symbols.json'
      );

      if (cancelled) {
        return;
      }

      const currentIntl = intlRef.current;
      const translatedSymbols = mulberrySymbols.map((symbol) => {
        const translatedId = getTranslatedSymbolId(currentIntl, symbol.id);

        return { ...symbol, translatedId, src: '' };
      });

      setSymbols(translatedSymbols);
    };

    void loadSymbols();

    return () => {
      cancelled = true;
    };
  }, [intl?.locale]);

  useEffect(() => {
    if (open && !openMirror) {
      setValue(autoFill);
      setOpenMirror(true);
    } else if (!open) {
      setOpenMirror(false);
    }
  }, [open, autoFill, openMirror]);

  const makeSuggestionKey = (s: SymbolData): string => {
    if (s.fromArasaac) return `arasaac:${s.keyPath ?? s.id}`;
    if (s.fromGlobalsymbols) return `globals:${s.id}`;
    return `mulberry:${s.id}`;
  };

  const mergeUniqueSuggestions = (
    existing: SymbolData[],
    additions: SymbolData[],
  ): SymbolData[] => {
    const map = new Map<string, SymbolData>();
    // keep order: existing first, then additions
    const hasImage = (s: SymbolData): boolean => {
      return Boolean((s.src && s.src.length) || s.keyPath);
    };

    existing.concat(additions).some((s) => {
      if (!hasImage(s)) return false;
      const key = makeSuggestionKey(s);
      if (!map.has(key)) map.set(key, s);
      return false;
    });

    const result = Array.from(map.values());
    return result.slice(0, maxSuggestions);
  };

  const getSuggestionValue = (suggestion: SymbolData): string => {
    return suggestion.id;
  };

  const getMulberrySuggestions = (value: string): SymbolData[] => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return symbols.filter((symbol) => {
      if (count >= maxSuggestions) {
        return false;
      }
      const translatedId = symbol.translatedId;
      let keep = translatedId.slice(0, inputLength) === inputValue;

      if (!keep) {
        const words = translatedId.split(' ');

        for (let i = 1; i < words.length; i += 1) {
          keep = words[i].slice(0, inputLength) === inputValue;

          if (keep) {
            break;
          }
        }
      }

      if (keep) {
        count += 1;
      }
      return keep;
    });
  };

  const fetchArasaacSuggestions = async (
    searchText: string,
  ): Promise<SymbolData[]> => {
    if (!intl || !searchText) {
      return [];
    }

    try {
      const imagesFromDB = await arasaacDB.getImagesByKeyword(
        searchText.trim(),
      );

      if (imagesFromDB.length) {
        const arasaacSuggestions = imagesFromDB.map(({ label, id }) => {
          return {
            id,
            src: `${ARASAAC_BASE_PATH_API}pictograms/${id}?${queryString.stringify(
              { skin, hair },
            )}`,
            keyPath: id,
            translatedId: label,
            fromArasaac: true,
          };
        });
        return arasaacSuggestions;
      } else {
        const results = await useArasaacStore
          .getState()
          .searchPictograms(intl.locale, searchText);

        if (results.length) {
          const arasaacSuggestions = results.map(
            ({
              _id: idPictogram,
              keywords,
            }: {
              _id: string;
              keywords: { keyword: string }[];
            }) => {
              const keyword = keywords[0];
              return {
                id: keyword.keyword,
                src: `${ARASAAC_BASE_PATH_API}pictograms/${idPictogram}?${queryString.stringify(
                  { skin, hair },
                )}`,
                translatedId: keyword.keyword,
                fromArasaac: true,
              };
            },
          );

          return arasaacSuggestions;
        }
      }

      return [];
    } catch (err) {
      console.error('Unexpected error fetching ARASAAC suggestions', err);
      return [];
    }
  };

  const fetchGlobalsymbolsSuggestions = async (
    searchText: string,
  ): Promise<SymbolData[]> => {
    if (!intl) {
      return [];
    }

    try {
      let language = intl.locale !== 'me' ? intl.locale : 'cnr';
      const results = await useGlobalSymbolsStore
        .getState()
        .searchPictograms(language, searchText);

      if (results.length) {
        const globalsymbolsSuggestions: SymbolData[] = [];
        results.forEach(
          (element: { text: string; picto: { image_url: string } }) => {
            const fixEspecialCharacters = (text: string): string => {
              if (!text) return '';
              const utf8String = text
                .replace(/Ã¡/g, '\\u00E1') // Replace á
                .replace(/Ã©/g, '\\u00E9') // Replace é
                .replace(/Ã­/g, '\\u00ED') // Replace í
                .replace(/Ã³/g, '\\u00F3') // Replace ó
                .replace(/Ãº/g, '\\u00FA') // Replace ú
                .replace(/Ã±/g, '\\u00F1') // Replace ñ
                .replace(/Ã'/g, '\\u00D1') // Replace Ñ
                .replace(/Ã€/g, '\\u00C0') // Replace À
                .replace(/Ãˆ/g, '\\u00C8') // Replace È
                .replace(/ÃŒ/g, '\\u00CC') // Replace Ì
                .replace(/Ã'/g, '\\u00D2') // Replace Ò
                .replace(/Ã™/g, '\\u00D9') // Replace Ù
                .replace(/Ã¤/g, '\\u00E4') // Replace ä
                .replace(/Ã«/g, '\\u00EB') // Replace ë
                .replace(/Ã¯/g, '\\u00EF') // Replace ï
                .replace(/Ã¶/g, '\\u00F6') // Replace ö
                .replace(/Ã¼/g, '\\u00FC') // Replace ü
                .replace(/Ã„/g, '\\u00C4') // Replace Ä
                .replace(/Ã‹/g, '\\u00CB') // Replace Ë
                .replace(/Ã�/g, '\\u00CF') // Replace Ï
                .replace(/Ã–/g, '\\u00D6') // Replace Ö
                .replace(/Ãœ/g, '\\u00DC'); // Replace Ü

              return utf8String;
            };

            const symbolText = fixEspecialCharacters(element.text);
            globalsymbolsSuggestions.push({
              id: symbolText,
              src: element.picto.image_url,
              translatedId: symbolText,
              fromGlobalsymbols: true,
            });
          },
        );
        return globalsymbolsSuggestions;
      }
      return [];
    } catch (err) {
      console.error(
        'Unexpected error fetching Global Symbols suggestions',
        err,
      );
      return [];
    }
  };

  const getSuggestions = async (
    value: string,
    currentSymbolSets: SymbolOption[] = symbolSets,
  ): Promise<void> => {
    const trimmedValue = value.trim();
    const reqId = ++requestIdRef.current;

    if (!trimmedValue.length) {
      setHasSearched(false);
      setSuggestions([]);
      setIsFetchingSuggestions(false);
      return;
    }

    setHasSearched(true);
    setSuggestions([]);
    const hasImage = (s: SymbolData): boolean =>
      Boolean((s.src && s.src.length) || s.keyPath);
    const mulberrySuggestions = currentSymbolSets[Number(SymbolSets.mulberry)]
      .enabled
      ? getMulberrySuggestions(trimmedValue).filter(hasImage)
      : [];

    // Mulberry is local and synchronous
    if (currentSymbolSets[Number(SymbolSets.mulberry)].enabled) {
      if (requestIdRef.current === reqId) {
        setSuggestions(mulberrySuggestions);
      }
    }

    const asyncFetchers: Promise<SymbolData[]>[] = [];

    if (currentSymbolSets[Number(SymbolSets.global)].enabled) {
      asyncFetchers.push(fetchGlobalsymbolsSuggestions(trimmedValue));
    }

    if (currentSymbolSets[Number(SymbolSets.arasaac)].enabled) {
      asyncFetchers.push(fetchArasaacSuggestions(trimmedValue));
    }

    if (!asyncFetchers.length) {
      setIsFetchingSuggestions(false);
      return;
    }

    setIsFetchingSuggestions(true);
    try {
      const asyncSuggestions = await Promise.all(asyncFetchers);
      if (requestIdRef.current !== reqId) {
        return;
      }
      const mergedSuggestions = asyncSuggestions.reduce(
        (accumulator, current) => mergeUniqueSuggestions(accumulator, current),
        mulberrySuggestions,
      );
      setSuggestions(mergedSuggestions);
    } catch (error) {
      console.error('Unexpected error fetching symbol suggestions', error);
    } finally {
      if (requestIdRef.current === reqId) {
        setIsFetchingSuggestions(false);
      }
    }
  };

  const handleSuggestionsFetchRequested = ({
    reason,
  }: {
    value: string;
    reason: string;
  }): void => {
    if (reason === 'suggestion-selected') return;
  };

  const handleSuggestionsClearRequested = (): void => {};

  const handleSuggestionSelected = async (
    event: React.FormEvent<unknown>,
    { suggestion }: { suggestion: SymbolData },
  ): Promise<void> => {
    setValue('');

    const label = autoFill.length ? autoFill : suggestion.translatedId;

    const resolveArasaacImageUrl = async (): Promise<string> => {
      const suggestionImageReq = `${suggestion.src}&url=true`;
      const imageArasaacUrl = await useArasaacStore
        .getState()
        .getImageUrl(suggestionImageReq);

      if (!imageArasaacUrl.length && suggestion.keyPath)
        return `https://static.arasaac.org/pictograms/${suggestion.keyPath}/${suggestion.keyPath}_500.png`;

      if (imageArasaacUrl.length) {
        return imageArasaacUrl;
      }

      // return static url when cannot retrieve the image from arasaac server
      if (suggestion.keyPath) {
        return `https://static.arasaac.org/pictograms/${suggestion.keyPath}/${suggestion.keyPath}_500.png`;
      }

      return suggestion.src;
    };

    const symbolImage = suggestion.fromArasaac
      ? await resolveArasaacImageUrl()
      : suggestion.src;

    const keyPath = suggestion.keyPath ? suggestion.keyPath : undefined;

    await onChange({
      image: symbolImage,
      keyPath: keyPath,
      label: label,
      labelKey: undefined,
    });

    onClose();
  };

  const handleChange = (
    event: React.FormEvent<unknown>,
    { newValue }: { newValue: string },
  ): void => {
    setValue(newValue);
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key !== 'Enter') return;

    const activeDescendant = event.currentTarget.getAttribute(
      'aria-activedescendant',
    );
    if (activeDescendant) return;

    event.preventDefault();
    void getSuggestions(event.currentTarget.value, symbolSets);
  };

  const renderSuggestion = (
    suggestion: SymbolData,
    { isHighlighted }: { isHighlighted: boolean },
  ): React.ReactNode => {
    const suggestionClassName = classNames('SymbolSearch__Suggestion', {
      'SymbolSearch__Suggestion--highlighted': isHighlighted,
    });

    return (
      <div className={suggestionClassName}>
        <Symbol
          label={suggestion.translatedId}
          image={suggestion.src}
          keyPath={suggestion.keyPath}
          labelpos={LABEL_POSITION_BELOW}
        />
      </div>
    );
  };

  const renderSuggestionsContainer = (options: {
    containerProps: Record<string, unknown>;
    children: React.ReactNode;
  }): React.ReactNode => {
    const { containerProps, children } = options;
    return <div {...containerProps}>{children}</div>;
  };

  const handleChangeOption = (opt: SymbolOption): void => {
    const newSymbolSets = symbolSets.map((option) => {
      if (option.id === opt.id) {
        return { ...option, enabled: !option.enabled };
      }
      return option;
    });

    setSymbolSets(newSymbolSets);
    // call suggestions with the updated symbol sets immediately
    void getSuggestions(value, newSymbolSets);
  };

  const handleClearSuggest = (): void => {
    requestIdRef.current += 1;
    setValue('');
    setSuggestions([]);
    setHasSearched(false);
    setIsFetchingSuggestions(false);
  };

  const clearButton =
    value.length > 0 ? (
      <div className="react-autosuggest__clear">
        <Tooltip
          title={intl ? intl.formatMessage(messages.clearText) : 'Clear Text'}
          aria-label={
            intl ? intl.formatMessage(messages.clearText) : 'Clear Text'
          }
        >
          <IconButton onClick={handleClearSuggest}>
            <BackspaceIcon style={{ color: 'white' }} />
          </IconButton>
        </Tooltip>
      </div>
    ) : null;

  const autoSuggest = (
    <div className="react-autosuggest__container">
      <Autosuggest
        aria-label="Search auto-suggest"
        alwaysRenderSuggestions={true}
        suggestions={suggestions}
        focusInputOnSuggestionClick={!isMobile().any}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        onSuggestionSelected={handleSuggestionSelected}
        renderSuggestionsContainer={renderSuggestionsContainer}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        highlightFirstSuggestion={false}
        inputProps={{
          autoFocus: true,
          placeholder: intl
            ? intl.formatMessage(messages.searchSymbolLibrary)
            : 'Search Symbol Library',
          value,
          onChange: handleChange,
          onKeyDown: handleInputKeyDown,
        }}
      />
      {clearButton}
    </div>
  );

  const shouldShowIntroMessage = !hasSearched;
  const shouldShowNoResultsMessage =
    hasSearched && !isFetchingSuggestions && suggestions.length === 0;
  const introMessage = intl
    ? intl.formatMessage(messages.typeToSearch)
    : 'Escriba arriba para buscar simbolos. Presione enter para realizar la busqueda.';
  const noResultsMessage = intl
    ? intl.formatMessage(messages.noResults)
    : 'No se encontro ningun resultado';

  return (
    <div>
      <FullScreenDialog
        open={open}
        buttons={autoSuggest}
        transition="fade"
        onClose={onClose}
      >
        <FilterBar options={symbolSets} onChange={handleChangeOption} />
        {(shouldShowIntroMessage || shouldShowNoResultsMessage) && (
          <div className="SymbolSearch__Message">
            {shouldShowIntroMessage ? introMessage : noResultsMessage}
          </div>
        )}
      </FullScreenDialog>
    </div>
  );
};

export default injectIntl(SymbolSearch);
