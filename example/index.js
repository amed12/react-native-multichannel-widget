/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {displayRemoteNotification} from './src/notifications';

const backgroundMessageHandler = async remoteMessage => {
  console.log('[Firebase] Background message received:', remoteMessage?.messageId);
  await displayRemoteNotification(remoteMessage);
};

messaging().setBackgroundMessageHandler(backgroundMessageHandler);
AppRegistry.registerHeadlessTask('ReactNativeFirebaseMessagingHeadlessTask', () => backgroundMessageHandler);

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    console.log('[Notifee] Notification interaction', detail.notification?.data);
  }
});

AppRegistry.registerComponent(appName, () => App);
