import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { restoreSession } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';

function Bootstrap() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);
  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Bootstrap />
      </SafeAreaProvider>
    </Provider>
  );
}
