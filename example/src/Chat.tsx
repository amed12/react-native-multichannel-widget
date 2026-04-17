import {
  IAvatarConfig,
  MultichannelWidget,
  useMultichannelWidget,
} from '@qiscus-community/react-native-multichannel-widget';
import { useEffect } from 'react';
import { useFilePicker } from './use-file-picker';

export const baseColor = '#2B3D41';
export const bgColor = '#4C5F6B';
export const fgColor = '#83A0A0';

export function Chat() {
  const widget = useMultichannelWidget();

  // Picker callbacks — implemented with expo-document-picker.
  // Swap useFilePicker with any other hook that returns { pickImage, pickDocument }
  // as long as each callback resolves to { uri, type, name }.
  const { pickImage, pickDocument } = useFilePicker();

  useEffect(() => {
    widget.setRoomTitle('Room Title');
    // widget.setRoomSubTitle(IRoomSubtitleConfig.Editable, 'Room subtitle');
    widget.setNavigationColor(bgColor);
    widget.setNavigationTitleColor(fgColor);
    widget.setBaseColor(baseColor);
    widget.setRightBubbleColor(bgColor);
    widget.setLeftBubbleColor(bgColor);
    widget.setRightBubbleTextColor(fgColor);
    widget.setLeftBubbleTextColor(fgColor);
    widget.setSendContainerBackgroundColor(bgColor);
    widget.setSendContainerColor(fgColor);
    widget.setFieldChatBorderColor(fgColor);
    widget.setFieldChatIconColor(fgColor);
    widget.setFieldChatTextColor(fgColor);
    widget.setAvatar(IAvatarConfig.Disabled);
    // widget.setHideUIEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MultichannelWidget
      onBack={() => widget.clearUser()}
      pickImage={pickImage}
      pickDocument={pickDocument}
    />
  );
}
