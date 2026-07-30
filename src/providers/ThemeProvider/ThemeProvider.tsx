import { amber } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import React, { ReactNode } from 'react';

import RTLSupport from './RTLSupport';
import { FONTS_FAMILIES, DEFAULT_FONT_FAMILY } from './ThemeProvider.constants';
import { useAppStore } from '@/domains/app/stores/appStore';
import { useLanguageStore } from '@/domains/settings/stores/languageStore';

const setRootFontFamily = (fontFamily: string): void => {
  const rootElement = document.querySelector(':root') as HTMLElement;
  if (rootElement) {
    rootElement.style.fontFamily = fontFamily;
  }
};

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dir = useLanguageStore((state) => state.dir);
  const displaySettings = useAppStore((state) => state.displaySettings);
  const darkThemeActive = displaySettings.darkThemeActive;
  const fontFamilyName = displaySettings.fontFamily || DEFAULT_FONT_FAMILY;
  const fontFamily =
    FONTS_FAMILIES.find((font) => font.fontName === fontFamilyName)
      ?.fontFamily || FONTS_FAMILIES[0].fontFamily;

  setRootFontFamily(fontFamily);

  const baseTheme = createTheme({
    typography: { fontFamily },
    direction: dir,
  });

  const theme = createTheme({
    ...baseTheme,
    palette: {
      mode: darkThemeActive ? 'dark' : 'light',
      primary: {
        main: darkThemeActive ? '#78909c' : baseTheme.palette.primary.main,
      },
      secondary: {
        main: amber[500],
      },
    },
  });

  document.body.setAttribute('dir', dir);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <RTLSupport dir={dir}>{children}</RTLSupport>
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
