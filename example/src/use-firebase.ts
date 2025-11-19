import notifee from '@notifee/react-native';
import { useMultichannelWidget } from '@qiscus-community/react-native-multichannel-widget';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { displayRemoteNotification } from './notifications';

/**
 * Firebase Cloud Messaging hook for push notifications
 * Following React Native Firebase documentation: https://rnfirebase.io/
 */
export function useFirebase() {
  const widget = useMultichannelWidget();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    let unsubscribeOnMessage: (() => void) | undefined;
    let unsubscribeNotificationOpened: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;

    const setupFirebase = async () => {
      try {
        await notifee.requestPermission();

        // Request permission for FCM
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('[Firebase] Notification permission not granted');
          throw new Error('Notification permission denied');
        }

        console.log('[Firebase] Authorization status:', authStatus);

        // Register device for remote messages on iOS
        if (Platform.OS === 'ios' && !messaging().isDeviceRegisteredForRemoteMessages) {
          await messaging().registerDeviceForRemoteMessages();
          console.log('[Firebase] Device registered for remote messages');
        }

        // Get FCM token and set as device ID
        const token = await messaging().getToken();
        if (token) {
          console.log('[Firebase] FCM Token:', token);
          widget.setDeviceId?.(token);
        } else {
          console.warn('[Firebase] No FCM token received');
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
        const initialNotification = await messaging().getInitialNotification();
        if (initialNotification) {
          console.log('[Firebase] App opened from quit state by notification:', initialNotification);
        }

        // Handle token refresh
        unsubscribeTokenRefresh = messaging().onTokenRefresh((newToken: string) => {
          console.log('[Firebase] Token refreshed:', newToken);
          widget.setDeviceId?.(newToken);
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Firebase] Setup error:', errorMessage);
        
        // Don't retry on permission denial or iOS simulator limitations
        if (errorMessage.includes('permission') || 
            errorMessage.includes('unregistered') ||
            errorMessage.includes('simulator')) {
          console.warn('[Firebase] Skipping Firebase setup due to:', errorMessage);
          return;
        }
        
        throw error; // Re-throw unexpected errors
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
