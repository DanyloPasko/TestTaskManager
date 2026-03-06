import { useColorScheme } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { setUserTheme, ThemeType } from '../store/themeSlice';

export type Palette = {
  background: string;
  text: string;
  secondary: string;
  primary: string,
};

const lightPalette: Palette = {
  background: '#fff',
  text: '#000',
  secondary: '#f0f0f0',
  primary: '#0f1cec',
};

const darkPalette: Palette = {
  background: '#121212',
  text: '#e5e5e5',
  secondary: '#1e1e1e',
  primary: '#0f1cec',
};

export const useTheme = () => {
  const dispatch = useDispatch();
  const userTheme = useSelector((state: RootState) => state.theme.userTheme);
  const systemTheme = useColorScheme();

  const effectiveTheme: ThemeType =
    userTheme === 'system' ? (systemTheme ?? 'light') : userTheme;

  const palette = effectiveTheme === 'dark' ? darkPalette : lightPalette;

  const setUserThemeHandler = (theme: ThemeType) => {
    dispatch(setUserTheme(theme));
  };

  return {
    userTheme,
    effectiveTheme,
    palette,
    setUserTheme: setUserThemeHandler,
  };
};
