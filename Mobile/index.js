import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

// Registers the gallery backup TaskManager task at global scope so the OS
// can invoke it in the background even when the app isn't in the foreground.
import './src/tasks/backgroundBackupTask';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
