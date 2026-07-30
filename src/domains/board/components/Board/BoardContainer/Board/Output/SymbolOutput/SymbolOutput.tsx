import ClearIcon from '@mui/icons-material/Clear';
import { IconButton as MUIIconButton, Tooltip } from '@mui/material';
import React, { useRef, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import BackspaceButton from './BackspaceButton/BackspaceButton';
import ClearButton from './ClearButton/ClearButton';
import messages from '../../../../Board.messages';
import PhraseShare from '../PhraseShare/PhraseShare.component';
import Scroll from './Scroll/Scroll';
import './SymbolOutput.css';
import SpeechButton from './SpeechButton/SpeechButton';
import { NavigationSettings } from '@/types/app';
import Symbol from '../../../../Symbol/Symbol';

interface SymbolItem {
  image?: string;
  label: string | React.ReactNode;
  type?: string;
  [key: string]: unknown;
}

interface SymbolOutputProps {
  symbols: SymbolItem[];
  playOutput: () => void;
  stopOutput: () => void;
  isPlaying: boolean;
  onBackspaceClick: () => void;
  onClearClick: () => void;
  onCopyClick: (phrase: string) => void;
  onRemoveClick: (index: number) => (event: React.MouseEvent) => void;
  navigationSettings: NavigationSettings;
  phrase: string;
  increaseOutputButtons?: boolean;
  tabIndex?: string;
}

const SymbolOutput: React.FC<SymbolOutputProps> = ({
  symbols = [],
  playOutput,
  stopOutput,
  isPlaying,
  onBackspaceClick,
  onClearClick,
  onCopyClick,
  onRemoveClick,
  navigationSettings,
  phrase,
  increaseOutputButtons,
  ...other
}) => {
  const intl = useIntl();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [openPhraseShareDialog, setOpenPhraseShareDialog] =
    useState<boolean>(false);

  const onSpeechActionClick = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!isPlaying) playOutput();
    if (isPlaying) stopOutput();
  };

  const scrollToLastSymbol = () => {
    try {
      const lastOutputSymbol = scrollContainerRef.current?.lastElementChild;
      if (lastOutputSymbol) {
        lastOutputSymbol.scrollIntoView({
          inline: 'end',
        });
      }
    } catch (err) {
      console.error('Error during autoScroll of output bar', err);
    }
  };

  useEffect(() => {
    scrollToLastSymbol();
  }, []);

  useEffect(() => {
    if (symbols.length > 0) {
      scrollToLastSymbol();
    }
  }, [symbols.length]);

  const clearButtonStyle: React.CSSProperties = {
    visibility: symbols.length ? 'visible' : 'hidden',
  };

  const speechButtonStyle: React.CSSProperties = {
    visibility: symbols.length ? 'visible' : 'hidden',
  };

  const removeButtonStyle: React.CSSProperties = {
    visibility: navigationSettings.removeOutputActive ? 'visible' : 'hidden',
  };

  const backspaceButtonStyle: React.CSSProperties = {
    visibility: navigationSettings.removeOutputActive ? 'hidden' : 'visible',
  };

  return (
    <div className="SymbolOutput">
      <Scroll scrollContainerReference={scrollContainerRef} {...other}>
        {symbols.map(({ image, label, type }, index) => (
          <div className="SymbolOutput__value" key={index}>
            <Symbol
              className="SymbolOutput__symbol"
              image={image}
              label={label}
              type={type}
              labelpos="Below"
            />
            <div className="SymbolOutput__value__IconButton">
              <MUIIconButton
                color="inherit"
                size="small"
                onClick={onRemoveClick(index)}
                disabled={!navigationSettings.removeOutputActive}
                style={removeButtonStyle}
              >
                <ClearIcon />
              </MUIIconButton>
            </div>
          </div>
        ))}
      </Scroll>
      <div
        style={{
          display: 'flex',
          marginLeft: 'auto',
          minWidth: 'fit-content',
        }}
      >
        <div
          className={
            increaseOutputButtons
              ? 'SymbolOutput__right__btns__lg'
              : 'SymbolOutput__right__btns'
          }
        >
          {!navigationSettings.removeOutputActive && (
            <Tooltip
              title={intl.formatMessage(
                isPlaying
                  ? messages.outputStopSpeech
                  : messages.outputPlaySpeech,
              )}
              placement="left"
            >
              <span>
                <SpeechButton
                  color="inherit"
                  onClick={onSpeechActionClick}
                  isPlaying={isPlaying}
                  style={speechButtonStyle}
                  hidden={!symbols.length}
                  increaseOutputButtons={increaseOutputButtons}
                />
              </span>
            </Tooltip>
          )}

          <PhraseShare
            label={intl.formatMessage(messages.share)}
            intl={intl}
            onShareClick={() => setOpenPhraseShareDialog(true)}
            onShareClose={() => setOpenPhraseShareDialog(false)}
            onCopyPhrase={onCopyClick}
            open={openPhraseShareDialog}
            phrase={phrase}
            increaseOutputButtons={increaseOutputButtons}
          />

          {!navigationSettings.removeOutputActive && (
            <BackspaceButton
              onClick={onBackspaceClick}
              style={backspaceButtonStyle}
              hidden={navigationSettings.removeOutputActive}
              increaseOutputButtons={increaseOutputButtons}
            />
          )}

          <Tooltip
            title={intl.formatMessage(messages.outputCleanSpeech)}
            placement="left"
          >
            <span>
              <ClearButton
                color="inherit"
                onClick={onClearClick}
                style={clearButtonStyle}
                hidden={!symbols.length}
                increaseOutputButtons={increaseOutputButtons}
              />
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default SymbolOutput;
