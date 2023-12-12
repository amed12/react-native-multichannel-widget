import AsyncStorage from '@react-native-async-storage/async-storage';
import invariant from 'invariant';
import { useAtomCallback } from 'jotai/utils';
import { useCallback, useEffect } from 'react';
import {
  appIdAtom,
  baseColorThemeAtom,
  channelIdAtom,
  currentUserAtom,
  deviceIdAtom,
  emptyBackgroundColorThemeAtom,
  emptyTextColorThemeAtom,
  fieldChatBorderColorThemeAtom,
  fieldChatTextColorThemeAtom,
  lastUserTokenAtom,
  leftBubbleColorThemeAtom,
  leftBubbleTextColorThemeAtom,
  navigationColorThemeAtom,
  navigationTitleColorThemeAtom,
  notificationEnabledAtom,
  qiscusAtom,
  rightBubbleColorThemeAtom,
  rightBubbleTextColorThemeAtom,
  roomIdAtom,
  roomSenderAvatarEnabledAtom,
  roomSubtitleConfigAtom,
  roomSubtitleTextAtom,
  roomSystemEventHiddenAtom,
  roomTitleAtom,
  sendContainerBackgroundColorThemeAtom,
  sendContainerColorThemeAtom,
  STORAGE,
  systemEventTextColorThemeAtom,
  timeBackgroundColorThemeAtom,
  timeLabelTextColorThemeAtom,
  userConfigAvatarAtom,
  userConfigDisplayNameAtom,
  userConfigIdAtom,
  userConfigPropertiesAtom,
} from '../state';
import type {
  Account,
  IChatRoomConfigSetter,
  IRoomSubtitleConfig,
  IUseMultichannelWidget,
} from '../types';
import { IAvatarConfig } from '../types';
import { useAtomCallbackWithDeps } from './use-atom-callback-with-deps';
import { useClearUser } from './use-clear-user';
import { useComputedAtomValue } from './use-computed-atom-value';
import { useDebounceValue } from './use-debounce-value';
import { useInitiateChat } from './use-initiate-chat';
import { useSetUser } from './use-set-user';
import { useSetup } from './use-setup';
import { useUpdateRoomInfo } from './use-update-room-info';
import { useAtomValue, useSetAtom } from 'jotai';

export function useMultichannelWidget(): IUseMultichannelWidget {
  const setEnableNotification = useSetAtom(notificationEnabledAtom);
  const setDeviceId = useSetAtom(deviceIdAtom);
  const setChannelId = useSetAtom(channelIdAtom);
  const setRoomTitle = useSetAtom(roomTitleAtom);
  const setRoomSubtitleConfig = useSetAtom(roomSubtitleConfigAtom);
  const setRoomSubtitleText = useSetAtom(roomSubtitleTextAtom);

  const set_navigationColorThemeAtom = useSetAtom(navigationColorThemeAtom);
  const set_appBarColorThemeAtom = useSetAtom(navigationTitleColorThemeAtom);
  const set_sendContainerColorThemeAtom = useSetAtom(
    sendContainerColorThemeAtom
  );
  const set_fieldChatBorderColorThemeAtom = useSetAtom(
    fieldChatBorderColorThemeAtom
  );
  const set_fieldChatTextColorThemeAtom = useSetAtom(
    fieldChatTextColorThemeAtom
  );
  const set_sendContainerBackgroundColorThemeAtom = useSetAtom(
    sendContainerBackgroundColorThemeAtom
  );
  const set_navigationTitleColorThemeAtom = useSetAtom(
    navigationTitleColorThemeAtom
  );
  const set_systemEventTextColorThemeAtom = useSetAtom(
    systemEventTextColorThemeAtom
  );
  const set_leftBubbleColorThemeAtom = useSetAtom(leftBubbleColorThemeAtom);
  const set_rightBubbleColorThemeAtom = useSetAtom(rightBubbleColorThemeAtom);
  const set_leftBubbleTextColorThemeAtom = useSetAtom(
    leftBubbleTextColorThemeAtom
  );
  const set_rightBubbleTextColorThemeAtom = useSetAtom(
    rightBubbleTextColorThemeAtom
  );
  const set_timeLabelTextColorThemeAtom = useSetAtom(
    timeLabelTextColorThemeAtom
  );
  const set_timeBackgroundColorThemeAtom = useSetAtom(
    timeBackgroundColorThemeAtom
  );
  const set_baseColorThemeAtom = useSetAtom(baseColorThemeAtom);
  const set_emptyTextColorThemeAtom = useSetAtom(emptyTextColorThemeAtom);
  const set_emptyBackgroundColorThemeAtom = useSetAtom(
    emptyBackgroundColorThemeAtom
  );

  const isLoggedIn = useComputedAtomValue((get) => {
    return get(currentUserAtom) != null;
  });
  const setup = useSetup();
  const initiateChat_ = useInitiateChat();
  const setUser = useSetUser();
  const updateRoomInfo = useUpdateRoomInfo();

  const appId = useAtomValue(appIdAtom);
  const initiateChat = useAtomCallbackWithDeps(
    async (get) => {
      if (isLoggedIn) return;
      const userId = get(userConfigIdAtom);

      invariant(
        appId,
        'Missing `appId`, make sure you wrap your application inside `MultichannelWidgetProvider`'
      );
      invariant(
        userId,
        'Missing `userId`, make sure you have invoked `setUser` method'
      );

      const displayName = get(userConfigDisplayNameAtom);
      const deviceId = get(deviceIdAtom);
      const channelId = get(channelIdAtom);
      const avatar = get(userConfigAvatarAtom);
      const userProperties = get(userConfigPropertiesAtom);

      await setup(appId!);
      await initiateChat_({
        userId: userId!,
        name: displayName ?? userId!,
        deviceId,
        channelId,
        avatar,
        userProperties,
      });
    },
    [appId]
  );

  const setRoomSubTitle: IChatRoomConfigSetter['setRoomSubTitle'] = useCallback(
    (enabled: IRoomSubtitleConfig, subtitle?: string) => {
      setRoomSubtitleConfig(enabled);
      setRoomSubtitleText(subtitle);
    },
    [setRoomSubtitleConfig, setRoomSubtitleText]
  );

  const setHideUIEvent = useAtomCallbackWithDeps((_, set) => {
    set(roomSystemEventHiddenAtom, true);
  }, []);
  const setAvatar = useAtomCallbackWithDeps((_, set, arg: IAvatarConfig) => {
    set(roomSenderAvatarEnabledAtom, arg === IAvatarConfig.Enabled);
  }, []);
  const clearUser = useClearUser();

  const initialSetup = useAtomCallback(async (get, set) => {
    const qiscus = get(qiscusAtom);
    const lastUserData: Account | undefined = await AsyncStorage.getItem(
      STORAGE.lastUserData
    ).then((it) => (it != null ? JSON.parse(it) : undefined));
    const lastUserToken = await AsyncStorage.getItem(STORAGE.lastUserToken);
    const lastRoomId = await AsyncStorage.getItem(STORAGE.lastRoomId);
    const lastAppId = await AsyncStorage.getItem(STORAGE.lastAppId);

    if (lastUserData != null && lastUserToken != null) {
      setUser({
        userId: lastUserData.id,
        displayName: lastUserData.name,
        avatarUrl: lastUserData.avatarUrl,
        userProperties: lastUserData.extras,
      });
      set(lastUserTokenAtom, lastUserToken);
      set(currentUserAtom, lastUserData);

      // Internal code should not be used unless you know what you are doing
      // @ts-ignore
      qiscus.storage.setAppId(lastAppId);
      // @ts-ignore
      qiscus.storage.setCurrentUser(lastUserData);
      // @ts-ignore
      qiscus.storage.setToken(lastUserToken);
    }
    if (lastRoomId != null) set(roomIdAtom, parseInt(lastRoomId, 10));

    await updateRoomInfo();
  });

  useEffect(() => {
    initialSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useDebounceValue(
    {
      setEnableNotification,
      setDeviceId,
      setUser,
      setChannelId,
      setRoomTitle,
      setRoomSubTitle,
      setHideUIEvent,
      setAvatar,

      // Themes
      setNavigationColor: set_navigationColorThemeAtom,
      setAppBarColor: set_appBarColorThemeAtom,
      setSendContainerColor: set_sendContainerColorThemeAtom,
      setFieldChatBorderColor: set_fieldChatBorderColorThemeAtom,
      setFieldChatTextColor: set_fieldChatTextColorThemeAtom,
      setSendContainerBackgroundColor:
        set_sendContainerBackgroundColorThemeAtom,
      setNavigationTitleColor: set_navigationTitleColorThemeAtom,
      setSystemEventTextColor: set_systemEventTextColorThemeAtom,
      setLeftBubbleColor: set_leftBubbleColorThemeAtom,
      setRightBubbleColor: set_rightBubbleColorThemeAtom,
      setLeftBubbleTextColor: set_leftBubbleTextColorThemeAtom,
      setRightBubbleTextColor: set_rightBubbleTextColorThemeAtom,
      setTimeLabelTextColor: set_timeLabelTextColorThemeAtom,
      setTimeBackgroundColor: set_timeBackgroundColorThemeAtom,
      setBaseColor: set_baseColorThemeAtom,
      setEmptyTextColor: set_emptyTextColorThemeAtom,
      setEmptyBackgroundColor: set_emptyBackgroundColorThemeAtom,
      initiateChat,
      clearUser,
    },
    500
  );
}
