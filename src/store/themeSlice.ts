import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeState {
  userTheme: ThemeType;
}

const initialState: ThemeState = {
  userTheme: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setUserTheme(state, action: PayloadAction<ThemeType>) {
      state.userTheme = action.payload;
    },
  },
});

export const { setUserTheme } = themeSlice.actions;
export default themeSlice.reducer;
