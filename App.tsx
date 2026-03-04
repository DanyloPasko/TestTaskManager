import { StatusBar, View } from 'react-native';
import AppNavigator from './src/navigation/RootNavigation';
import { Provider } from 'react-redux';
import { persistor, store } from './src/store/store';
import 'react-native-get-random-values';
import { PersistGate } from 'redux-persist/integration/react';
import { useTheme } from './src/theme/designSystem.ts';

function InnerApp() {
  const { palette, effectiveTheme } = useTheme();

  const backgroundStyle = {
    backgroundColor: palette.background,
    flex: 1,
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <InnerApp />
      </PersistGate>
    </Provider>
  );
}
