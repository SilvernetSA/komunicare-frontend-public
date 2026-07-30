import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import LabelIcon from '@mui/icons-material/Label';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import {
  DISPLAY_SIZE_EXTRALARGE,
  DISPLAY_SIZE_LARGE,
  DISPLAY_SIZE_STANDARD,
  LABEL_POSITION_BELOW,
  LABEL_POSITION_ABOVE,
  LABEL_POSITION_HIDDEN,
} from './Display.constants';
import messages from './Display.messages';
import {
  DEFAULT_FONT_FAMILY,
  FONTS_FAMILIES,
} from '@/providers/ThemeProvider/ThemeProvider.constants';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useSettingsStore } from '@/domains/settings/stores/settingsStore';
import { DisplaySettings } from '@/types/app';
import FullScreenDialog from '@/domains/shared/components/UI/FullScreenDialog/FullScreenDialog';
import './Display.css';

// ─── Component ─────────────────────────────────────────────────────────────────

const Display: React.FC = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const displaySettings = useAppStore((state) => state.displaySettings);
  const persistSettings = useSettingsStore((state) => state.persistSettings);

  const [settings, setSettings] = useState<DisplaySettings>({
    ...displaySettings,
  });

  const updateDisplaySettings = (updated: DisplaySettings) => {
    void persistSettings({ display: updated });
  };

  const toggleHideOutput = () => {
    setSettings((prev) => ({
      ...prev,
      hideOutputActive: !prev.hideOutputActive,
    }));
  };

  const toggleIncreaseOutputButtons = () => {
    setSettings((prev) => ({
      ...prev,
      increaseOutputButtons: !prev.increaseOutputButtons,
    }));
  };

  const toggleDarkTheme = () => {
    setSettings((prev) => ({
      ...prev,
      darkThemeActive: !prev.darkThemeActive,
    }));
  };

  const onDisplaySettingsChange = (
    displaySetting: keyof DisplaySettings,
    event: { target: { value: string } },
  ) => {
    const { value } = event.target;
    setSettings((prev) => ({ ...prev, [displaySetting]: value }));
  };

  const renderSelect = (name: 'uiSize' | 'fontSize' | 'labelPosition') => (
    <FormControl size="small">
      <Select
        aria-label={intl.formatMessage(messages[name])}
        id={name}
        name={name}
        value={settings[name]}
        onChange={(e) => onDisplaySettingsChange(name, e)}
      >
        <MenuItem
          value={
            name === 'labelPosition'
              ? LABEL_POSITION_ABOVE
              : DISPLAY_SIZE_STANDARD
          }
        >
          {intl.formatMessage(
            name === 'labelPosition'
              ? messages[LABEL_POSITION_ABOVE]
              : messages[DISPLAY_SIZE_STANDARD],
          )}
        </MenuItem>
        <MenuItem
          value={
            name === 'labelPosition' ? LABEL_POSITION_BELOW : DISPLAY_SIZE_LARGE
          }
        >
          {intl.formatMessage(
            name === 'labelPosition'
              ? messages[LABEL_POSITION_BELOW]
              : messages[DISPLAY_SIZE_LARGE],
          )}
        </MenuItem>
        <MenuItem
          value={
            name === 'labelPosition'
              ? LABEL_POSITION_HIDDEN
              : DISPLAY_SIZE_EXTRALARGE
          }
        >
          {intl.formatMessage(
            name === 'labelPosition'
              ? messages[LABEL_POSITION_HIDDEN]
              : messages[DISPLAY_SIZE_EXTRALARGE],
          )}
        </MenuItem>
      </Select>
    </FormControl>
  );

  const renderFontFamilySelect = () => {
    const name = 'fontFamily';
    const actualFont = FONTS_FAMILIES.filter(
      (font) => font.fontName === settings[name],
    )[0];

    return (
      <FormControl size="small">
        <Select
          aria-label={intl.formatMessage(messages.fontFamily)}
          id={name}
          name={name}
          value={actualFont?.fontName || DEFAULT_FONT_FAMILY}
          onChange={(e) => onDisplaySettingsChange(name, e)}
          style={{ fontFamily: actualFont?.fontFamily }}
        >
          {FONTS_FAMILIES.map((font) => (
            <MenuItem
              key={font?.fontName}
              value={font?.fontName}
              style={{ fontFamily: font?.fontFamily }}
            >
              {font.fontName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const rows = [
    {
      icon: <AspectRatioIcon fontSize="inherit" />,
      color: '#7B1FA2',
      primary: <FormattedMessage {...messages.uiSize} />,
      secondary: <FormattedMessage {...messages.uiSizeSecondary} />,
      action: renderSelect('uiSize'),
    },
    {
      icon: <TextFieldsIcon fontSize="inherit" />,
      color: '#0288D1',
      primary: <FormattedMessage {...messages.fontFamily} />,
      secondary: <FormattedMessage {...messages.fontFamilySecondary} />,
      action: renderFontFamilySelect(),
    },
    {
      icon: <ZoomInIcon fontSize="inherit" />,
      color: '#1565C0',
      primary: <FormattedMessage {...messages.fontSize} />,
      secondary: <FormattedMessage {...messages.fontSizeSecondary} />,
      action: renderSelect('fontSize'),
    },
    {
      icon: <VisibilityOffIcon fontSize="inherit" />,
      color: '#00838F',
      primary: <FormattedMessage {...messages.outputHide} />,
      secondary: <FormattedMessage {...messages.outputHideSecondary} />,
      action: (
        <Switch
          checked={settings.hideOutputActive}
          onChange={toggleHideOutput}
          value="active"
          color="secondary"
        />
      ),
    },
    {
      icon: <ZoomOutMapIcon fontSize="inherit" />,
      color: '#EF6C00',
      primary: <FormattedMessage {...messages.outputIncreaseButtons} />,
      secondary: (
        <FormattedMessage {...messages.outputIncreaseButtonsSecondary} />
      ),
      action: (
        <Switch
          checked={settings.increaseOutputButtons ? true : false}
          onChange={toggleIncreaseOutputButtons}
          value="active"
          color="secondary"
        />
      ),
    },
    {
      icon: <LabelIcon fontSize="inherit" />,
      color: '#C62828',
      primary: <FormattedMessage {...messages.labelPosition} />,
      secondary: <FormattedMessage {...messages.labelPositionSecondary} />,
      action: renderSelect('labelPosition'),
    },
    {
      icon: <Brightness4Icon fontSize="inherit" />,
      color: '#283593',
      primary: <FormattedMessage {...messages.darkTheme} />,
      secondary: <FormattedMessage {...messages.darkThemeSecondary} />,
      action: (
        <Switch
          checked={settings.darkThemeActive}
          onChange={toggleDarkTheme}
          value="active"
          color="secondary"
        />
      ),
    },
  ];

  return (
    <FullScreenDialog
      open
      title={<FormattedMessage {...messages.display} />}
      onClose={() => navigate(-1)}
      onSubmit={() => updateDisplaySettings(settings)}
    >
      <div className="Display__body">
        {rows.map((row, i) => (
          <div className="Display__row-card" key={i}>
            <div
              className="Display__row-icon"
              style={{ background: row.color }}
            >
              {row.icon}
            </div>
            <div className="Display__row-text">
              <div className="Display__row-title">{row.primary}</div>
              <div className="Display__row-desc">{row.secondary}</div>
            </div>
            <div className="Display__row-action">{row.action}</div>
          </div>
        ))}
      </div>
    </FullScreenDialog>
  );
};

export default Display;
