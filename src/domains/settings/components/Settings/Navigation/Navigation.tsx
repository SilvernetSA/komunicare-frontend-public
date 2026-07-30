import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MenuIcon from '@mui/icons-material/Menu';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ShareIcon from '@mui/icons-material/Share';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { NAVIGATION_BUTTONS_STYLES } from './Navigation.constants';
import messages from './Navigation.messages';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useSettingsStore } from '@/domains/settings/stores/settingsStore';
import { NavigationSettings } from '@/types/app';
import FullScreenDialog from '@/domains/shared/components/UI/FullScreenDialog/FullScreenDialog';
import ResetToursItem from '@/domains/shared/components/UI/ResetToursItem/ResetToursItem';
import './Navigation.css';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const navigationSettings = useAppStore((state) => state.navigationSettings);
  const updateAppNavigationSettings = useAppStore(
    (state) => state.updateNavigationSettings,
  );
  const persistSettings = useSettingsStore((state) => state.persistSettings);

  const updateNavigationSettings = (updated: NavigationSettings) => {
    updateAppNavigationSettings(updated);
    void persistSettings({ navigation: updated as any });
  };

  const [settings, setSettings] = useState<NavigationSettings>({
    caBackButtonActive: navigationSettings?.caBackButtonActive ?? true,
    bigScrollButtonsActive: navigationSettings?.bigScrollButtonsActive ?? true,
    quickUnlockActive: navigationSettings?.quickUnlockActive ?? false,
    shareShowActive: navigationSettings?.shareShowActive ?? false,
    removeOutputActive: navigationSettings?.removeOutputActive ?? false,
    vocalizeFolders: navigationSettings?.vocalizeFolders ?? false,
    playSoundOnTouchActive: navigationSettings?.playSoundOnTouchActive ?? false,
    navigationButtonsStyle: navigationSettings?.navigationButtonsStyle,
  });

  const toggle = (key: keyof NavigationSettings) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const onSubmit = () => {
    updateNavigationSettings(settings);
  };

  const onNavigationStyleChange = (event: { target: { value: unknown } }) => {
    setSettings((prev) => ({
      ...prev,
      navigationButtonsStyle: event.target.value as string,
    }));
  };

  const navButtonsDisabled = !(
    settings.bigScrollButtonsActive || settings.caBackButtonActive
  );

  const actualButtonsStyle = NAVIGATION_BUTTONS_STYLES.find(
    (s) => s.value === settings.navigationButtonsStyle,
  );

  return (
    <div className="Navigation">
      <FullScreenDialog
        open
        title={<FormattedMessage {...messages.navigation} />}
        onClose={() => navigate(-1)}
        onSubmit={onSubmit}
      >
        <div className="Navigation__body">
          {/* ── Back button ──────────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#4E342E' }}
            >
              <ArrowBackIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.enable} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage {...messages.enableSecondary} />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                checked={settings.caBackButtonActive}
                onChange={() => toggle('caBackButtonActive')}
                color="secondary"
              />
            </div>
          </div>

          {/* ── Scroll buttons ───────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#00838F' }}
            >
              <UnfoldMoreIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.bigScroll} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage {...messages.bigScrollSecondary} />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                checked={settings.bigScrollButtonsActive}
                onChange={() => toggle('bigScrollButtonsActive')}
                color="secondary"
              />
            </div>
          </div>

          {/* ── Nav buttons style ────────────────────────────────────────── */}
          <div
            className={`Navigation__row-card${navButtonsDisabled ? ' Navigation__row-card--disabled' : ''}`}
          >
            <div
              className="Navigation__row-icon"
              style={{ background: '#1565C0' }}
            >
              <MenuIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.navigationButtonsStyle} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage
                  {...messages.navigationButtonsStyleSecondary}
                />
              </div>
            </div>
            <div className="Navigation__row-action">
              <FormControl size="small">
                <Select
                  aria-label="navigationButtonsStyle"
                  value={
                    actualButtonsStyle?.value ||
                    NAVIGATION_BUTTONS_STYLES[0].value
                  }
                  onChange={onNavigationStyleChange}
                  disabled={navButtonsDisabled}
                >
                  {NAVIGATION_BUTTONS_STYLES.map((style) => (
                    <MenuItem key={style.value} value={style.value}>
                      <FormattedMessage
                        {...messages[style.name as keyof typeof messages]}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          {/* ── Share show ──────────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#0288D1' }}
            >
              <ShareIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.shareShow} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage {...messages.shareShowSecondary} />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                checked={settings.shareShowActive}
                onChange={() => toggle('shareShowActive')}
                color="secondary"
              />
            </div>
          </div>

          {/* ── Remove output ────────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#C62828' }}
            >
              <DeleteSweepIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.outputRemove} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage {...messages.outputRemoveSecondary} />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                checked={settings.removeOutputActive}
                onChange={() => toggle('removeOutputActive')}
                color="secondary"
              />
            </div>
          </div>

          {/* ── Quick unlock (disabled) ──────────────────────────────────── */}
          <div className="Navigation__row-card Navigation__row-card--disabled">
            <div
              className="Navigation__row-icon"
              style={{ background: '#78909c' }}
            >
              <LockOpenIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.quickUnlock} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage {...messages.quickUnlockSecondary} />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                disabled
                checked={settings.quickUnlockActive}
                color="secondary"
              />
            </div>
          </div>

          {/* ── Vocalize folders ─────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#7B1FA2' }}
            >
              <FolderOpenIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.vocalizeFolders} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage {...messages.vocalizeFoldersSecondary} />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                checked={settings.vocalizeFolders}
                onChange={() => toggle('vocalizeFolders')}
                color="secondary"
              />
            </div>
          </div>

          {/* ── Reset tours ──────────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#EF6C00' }}
            >
              <RefreshIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <ResetToursItem />
            </div>
          </div>

          {/* ── Autoplay ─────────────────────────────────────────────────── */}
          <div className="Navigation__row-card">
            <div
              className="Navigation__row-icon"
              style={{ background: '#5C6BC0' }}
            >
              <PlayCircleOutlineIcon fontSize="inherit" />
            </div>
            <div className="Navigation__row-text">
              <div className="Navigation__row-title">
                <FormattedMessage {...messages.activePlaySoundOnTouch} />
              </div>
              <div className="Navigation__row-desc">
                <FormattedMessage
                  {...messages.activePlaySoundOnTouchSecondary}
                />
              </div>
            </div>
            <div className="Navigation__row-action">
              <Switch
                checked={settings.playSoundOnTouchActive || false}
                onChange={() => toggle('playSoundOnTouchActive')}
                color="secondary"
              />
            </div>
          </div>
        </div>
      </FullScreenDialog>
    </div>
  );
};

export default Navigation;
