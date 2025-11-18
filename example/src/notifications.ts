import notifee, {AndroidImportance} from '@notifee/react-native';
import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

const CHANNEL_ID = 'qiscus-channel';

let cachedChannelId: string | undefined;

async function ensureChannel(): Promise<string> {
  if (cachedChannelId) {
    return cachedChannelId;
  }

  cachedChannelId = await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Qiscus Notifications',
    description: 'Notifications for Qiscus chat messages',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });

  return cachedChannelId;
}

export async function displayRemoteNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  await ensureChannel();

  const payload = parsePayload(remoteMessage.data?.payload);
  const title = remoteMessage.notification?.title ?? payload?.title ?? 'New Message';
  const body =
    remoteMessage.notification?.body ??
    payload?.message ??
    payload?.body ??
    payload?.text ??
    '';

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data ?? undefined,
    android: {
      channelId: CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      foregroundPresentationOptions: {
        badge: true,
        sound: true,
        banner: true,
        list: true,
      },
    },
  });
}

function parsePayload(rawPayload?: string | object) {
  if (rawPayload == null) {
    return {};
  }

  if (typeof rawPayload === 'object') {
    return rawPayload;
  }

  try {
    return JSON.parse(rawPayload);
  } catch (error) {
    console.warn('[Notifications] Failed to parse payload', error);
    return {};
  }
}
