import notifee from '@notifee/react-native';
import { useMultichannelWidget } from '@qiscus-community/react-native-multichannel-widget';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { displayRemoteNotification } from './notifications';

/**
 * Firebase Cloud Messaging hook for push notifications
 * Following React Native Firebase documentation: https://rnfirebase.io/
 */
export function useFirebase() {
  const widget = useMultichannelWidget();

  useEffect(() => {
    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeNotificationOpened: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const setupFirebase = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        await notifee.requestPermission();

        // Request permission for FCM
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('[Firebase] Authorization status:', authStatus);
        }

        // Get FCM token and set as device ID
        const token = await messaging().getToken();
        if (token) {
          console.log('[Firebase] FCM Token:', token);
          widget.setDeviceId?.(token);
        }

        // Handle foreground messages
        unsubscribeOnMessage = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
          console.log('[Firebase] Foreground message received:', remoteMessage);
          await displayRemoteNotification(remoteMessage);
        });

        // Handle notification opened app from background/quit state
        unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
          (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
            console.log('[Firebase] Notification opened app from background:', remoteMessage);
          }
        );

        // Check if app was opened from a notification (quit state)
        messaging()
          .getInitialNotification()
          .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
            if (remoteMessage) {
              console.log('[Firebase] App opened from quit state by notification:', remoteMessage);
            }
          });

        // Handle token refresh
        unsubscribeTokenRefresh = messaging().onTokenRefresh((newToken: string) => {
          console.log('[Firebase] Token refreshed:', newToken);
          widget.setDeviceId?.(newToken);
        });
      } catch (error) {
        console.error('[Firebase] Setup error:', error);
      }
    };

    setupFirebase();

    return () => {
      unsubscribeOnMessage?.();
      unsubscribeNotificationOpened?.();
      unsubscribeTokenRefresh?.();
    };
  }, [widget]);
}
