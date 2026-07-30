import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SpeedIcon from '@mui/icons-material/Speed';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import debounce from 'lodash/debounce';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import {
  INCREMENT_PITCH,
  INCREMENT_RATE,
  MAX_PITCH,
  MAX_RATE,
  MIN_PITCH,
  MIN_RATE,
} from './Speech.constants';
import messages from './Speech.messages';
import { EMPTY_VOICES } from '@/providers/SpeechProvider/SpeechProvider.constants';
import {
  speak,
  cancelSpeech,
  changeVoice,
} from '@/providers/SpeechProvider/speechService';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';
import { useSettingsStore } from '@/domains/settings/stores/settingsStore';
import { useSpeechStore } from '@/domains/settings/stores/voicesStore';
import { DEFAULT_LANG } from '@/domains/app/components/App/App.constants';
import FullScreenDialog from '@/domains/shared/components/UI/FullScreenDialog/FullScreenDialog';
import './Speech.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Voice {
  name: string;
  lang: string;
  voiceURI: string;
  voiceSource: string;
  [key: string]: unknown;
}

interface SpeechOptions {
  voiceURI: string;
  pitch: number;
  rate: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getVoiceLabel = (voice: Voice): string | undefined => {
  if (!voice) return undefined;
  if (voice.name === 'srpski Crna Gora') return voice.voiceURI;
  return voice.name;
};

// ─── Component ─────────────────────────────────────────────────────────────────

const Speech: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const lang = useLanguageStore((state) => state.lang);
  const speech = useSpeechStore((state) => state);
  const persistSettings = useSettingsStore((state) => state.persistSettings);

  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);

  const updateSettingsTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const speakSample = useMemo(
    () =>
      debounce(() => {
        const text = intl
          ? intl.formatMessage(messages.sampleSentence)
          : 'Sample sentence';
        cancelSpeech();
        speak(text);
      }, 500),
    [intl],
  );

  useEffect(() => {
    return () => {
      speakSample.cancel();
    };
  }, [speakSample]);

  const updateSettings = (
    property: keyof SpeechOptions,
    value: string | number,
  ) => {
    if (updateSettingsTimeout.current) {
      clearTimeout(updateSettingsTimeout.current);
    }

    updateSettingsTimeout.current = setTimeout(() => {
      const {
        options: { voiceURI, pitch, rate },
      } = speech;

      const speechSettings = { voiceURI, pitch, rate, [property]: value };
      void persistSettings({ speech: speechSettings });
    }, 500);
  };

  const handleClickVoiceCard = (event: React.MouseEvent<HTMLElement>) => {
    setIsVoiceOpen(true);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = async (voice: Voice, index: number) => {
    changeVoice({ voiceURI: voice.voiceURI, lang: voice.lang });
    speakSample();
    updateSettings('voiceURI', voice.voiceURI);
    setIsVoiceOpen(false);
    setSelectedVoiceIndex(index);
  };

  const handleChangePitch = async (_event: Event, value: number) => {
    updateSettings('pitch', value);
    useSpeechStore.getState().changePitch(value);
    speakSample();
  };

  const handleChangeRate = async (_event: Event, value: number) => {
    updateSettings('rate', value);
    useSpeechStore.getState().changeRate(value);
    speakSample();
  };

  const {
    voices: speechVoices,
    options: { voiceURI, pitch, rate },
  } = speech;

  const langVoices = speechVoices.filter(
    (voice) => voice.lang.slice(0, 2) === lang.slice(0, 2),
  );

  let voice: Voice = speechVoices.find((v) => voiceURI === v.voiceURI) as Voice;
  if (!voice && speechVoices && speechVoices.length) {
    voice = speechVoices[0] as Voice;
  } else if (!voice && !speechVoices) {
    voice = {
      lang: DEFAULT_LANG,
      voiceURI: EMPTY_VOICES,
      voiceSource: 'local',
      name: EMPTY_VOICES,
    };
  }

  const isCloud = voice && voice.voiceSource === 'cloud';

  return (
    <div className="Speech">
      <FullScreenDialog
        open
        title={<FormattedMessage {...messages.speech} />}
        onClose={() => navigate(-1)}
      >
        <div className="Speech__body">
          {/* ── Voice selector ─────────────────────────────────────────────── */}
          <button
            className="Speech__voice-card"
            aria-haspopup="true"
            aria-controls="voice-menu"
            aria-label="Voice"
            onClick={handleClickVoiceCard}
          >
            <div className="Speech__voice-icon">
              <RecordVoiceOverIcon fontSize="inherit" />
            </div>
            <div className="Speech__voice-info">
              <div className="Speech__voice-label">
                <FormattedMessage {...messages.voice} />
              </div>
              <div className="Speech__voice-name">
                {getVoiceLabel(voice) ?? '—'}
              </div>
            </div>
            <ChevronRightIcon className="Speech__voice-chevron" />
          </button>

          {/* ── Pitch ──────────────────────────────────────────────────────── */}
          <div
            className={`Speech__slider-card${isCloud ? ' Speech__slider-card--disabled' : ''}`}
            aria-label={intl ? intl.formatMessage(messages.pitch) : 'Pitch'}
          >
            <div className="Speech__slider-header">
              <div
                className="Speech__slider-icon"
                style={{ background: '#7B1FA2' }}
              >
                <GraphicEqIcon fontSize="inherit" />
              </div>
              <div className="Speech__slider-text">
                <div className="Speech__slider-title">
                  <FormattedMessage {...messages.pitch} />
                </div>
                <div className="Speech__slider-desc">
                  <FormattedMessage {...messages.pitchDescription} />
                </div>
              </div>
            </div>
            <div className="Speech__slider-track">
              <Slider
                value={pitch}
                min={MIN_PITCH}
                max={MAX_PITCH}
                step={INCREMENT_PITCH}
                onChange={handleChangePitch as any}
                disabled={isCloud}
              />
              <div className="Speech__slider-ends">
                <span className="Speech__slider-end">Grave</span>
                <span className="Speech__slider-end">Agudo</span>
              </div>
            </div>
          </div>

          {/* ── Rate ───────────────────────────────────────────────────────── */}
          <div
            className={`Speech__slider-card${isCloud ? ' Speech__slider-card--disabled' : ''}`}
            aria-label={intl ? intl.formatMessage(messages.rate) : 'Rate'}
          >
            <div className="Speech__slider-header">
              <div
                className="Speech__slider-icon"
                style={{ background: '#0288D1' }}
              >
                <SpeedIcon fontSize="inherit" />
              </div>
              <div className="Speech__slider-text">
                <div className="Speech__slider-title">
                  <FormattedMessage {...messages.rate} />
                </div>
                <div className="Speech__slider-desc">
                  <FormattedMessage {...messages.rateDescription} />
                </div>
              </div>
            </div>
            <div className="Speech__slider-track">
              <Slider
                value={rate}
                min={MIN_RATE}
                max={MAX_RATE}
                step={INCREMENT_RATE}
                onChange={handleChangeRate as any}
                disabled={isCloud}
              />
              <div className="Speech__slider-ends">
                <span className="Speech__slider-end">Lento</span>
                <span className="Speech__slider-end">Rápido</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Voice menu ───────────────────────────────────────────────────── */}
        {langVoices.length > 0 && (
          <Menu
            id="voice-menu"
            anchorEl={anchorEl}
            open={isVoiceOpen}
            onClose={() => setIsVoiceOpen(false)}
          >
            {langVoices.map((voice, index) => (
              <MenuItem
                key={index}
                selected={index === selectedVoiceIndex}
                onClick={() => handleMenuItemClick(voice as Voice, index)}
              >
                <div className="Speech__VoiceMenuItemText">
                  <div className="Speech__VoiceLabel">
                    {getVoiceLabel(voice as Voice)}
                  </div>
                  {voice.voiceSource === 'cloud' && (
                    <Chip label="online" size="small" color="secondary" />
                  )}
                </div>
              </MenuItem>
            ))}
          </Menu>
        )}
      </FullScreenDialog>
    </div>
  );
};

export default Speech;
