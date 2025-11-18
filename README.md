# [Widget] Documentation React Native

## Requirements

- ReactNative: ^0.63.4

## Dependency

This package relies on several peer dependencies that must already exist in your host app:

- `@react-native-async-storage/async-storage`: ^2.1.1
- `react-native-document-picker`: ^9.3.1
- `react-native-svg`: ^15.11.2

Because they are peer dependencies, they **must** be installed in the consumer app in addition to the widget.

## Installation

```
# Qiscus Multichannel main package
yarn add @qiscus-community/react-native-multichannel-widget

# Dependencies required for qiscus multichannel
yarn add @react-native-async-storage/async-storage react-native-document-picker react-native-svg
```

### Native setup

All three peer dependencies contain native code. React Native autolinking will register them on iOS and Android, but you still have to complete the platform build steps:

1. iOS
   - Run `cd ios && pod install && cd ..` to install the pods produced by the packages above.
   - Ensure your Podfile uses `use_frameworks! :linkage => :static` or the default CocoaPods linking mode so `RNSVG`, `RNDocumentPicker`, and `RNAsyncStorage` are compiled into the app.
2. Android
   - No manual linking is needed (RN >= 0.63), but you must re-run Gradle after dependencies change: `cd android && ./gradlew clean && cd ..` or rebuild from Android Studio.
   - Confirm that your app already requests the runtime permissions required by `react-native-document-picker` (e.g. READ/WRITE external storage if you support Android versions that still need them). The library will prompt users, but the permissions must exist in `AndroidManifest.xml`.

After these steps, rebuild the native app (Xcode/Android Studio or `yarn ios` / `yarn android`) so the widget can access the peer dependencies.

## How To Use

### Initialization

In order to use `QiscusMultichannelWidge`t, you need to initialize it with your AppID (`YOUR_APP_ID`). Get more information to get AppID from [Qiscus Multichannel Chat page](https://multichannel.qiscus.com/)

```javascript
// Wrap your outer most component with `MultichannelWidgetProvider`
// for example
import { MultichannelWidgetProvider } from '@qiscus-community/react-native-multichannel-widget';
<MultichannelWidgetProvider appId={APP_ID}>
  <App />
</MultichannelWidgetProvider>;
```

After the initialization, you can access all the widget's functions.

### Set The User

Set UserId before start the chat, this is mandatory.

```javascript
import { useMultichannelWidget } from '@qiscus-community/react-native-multichannel-widget';

// ... inside your component
const widget = useMultichannelWidget();
widget.setUser({
  userId: 'unique-user-id',
  displayName: 'Display Name for this user',
  avatarUrl: 'https://via.placeholder.com/200',
});

// if you want to set user properties
widget.setUser({
  userId: 'unique-user-id',
  displayName: 'Display Name for this user',
  avatarUrl: 'https://via.placeholder.com/200',
  userProperties: {
    extra_property_key: 'extra property value',
  },
});
```

### Get Login Status

Use this function to check whether the user has already logged in.

```javascript
import { useCurrentUser } from '@qiscus-community/react-native-multichannel-widget';

// ... inside your component
const user = useCurrentUser();

// check user value null or not
const isLoggedIn = useMemo(() => user == null, [user]);
```

### Start Chat

Use this function to start a chat.

```javascript
widget
  .initiateChat()
  .then(() => console.log('success initiating chat'))
  .catch((e: unknown) => console.error('error while initiating chat'));
}
```

### Clear User

Use this function to clear the logged-in users.

```javascript
widget.clearUser();
```

### Hide system message

configure system message visibility by calling setShowSystemMessage(isShowing: Bool).

```javascript
widget.setHideUIEvent();
```

## Customization

We provide several functions to customize the User Interface.

### Config

Use this method to configure the widget properties.
Channel Id is an identity for each widget channel. If you have a specific widget channel that you want to integrate into the mobile in-app widget, you can add your channel_id when you do initiateChat.

| Method Name                         | Description                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| setRoomTitle                        | Set room name base on customer's name or static default.         |
| setRoomSubTitle                     |                                                                  |
|                                     | setRoomSubTitle(IRoomSubtitleConfig.Enabled)                     | Set enable room sub name by the system.          |
|                                     | setRoomSubTitle(IRoomSubtitleConfig.Disabled)                    | Set disable room sub name.                      |
|                                     | setRoomSubTitle(IRoomSubtitleConfig.Editable, "Custom subtitle") | Set enable room sub name base on static default. |
| setHideUIEvent                      | Show/hide system event.                                          |
| setAvatar                           |                                                                  |
|                                     | setAvatar(IAvatarConfig.Enable)                                  | Set enable avatar and name                       |
|                                     | setAvatar(IAvatarConfig.Disabled)                                | Set disable avatar and name                      |
| setEnableNotification               | Set enable app notification.                                     |
| setChannelId(channelId: channel_id) | Use this function to set your widget channel Id                  |

### Color

| Method Name                     | Description                                                  |
| ------------------------------- | ------------------------------------------------------------ |
| setNavigationColor              | Set navigation color.                                        |
| setNavigationTitleColor         | Set room title, room subtitle, and back button border color. |
| setSendContainerColor           | Set icon send border-color.                                  |
| setSendContainerBackgroundColor | Set send container background-color.                         |
| setFieldChatBorderColor         | Set field chat border-color.                                  |
| setFieldChatTextColor           | Set field chat text color.                                    |
| setFieldChatIconColor           | Set field chat icon color.                                    |
| setSystemEventTextColor         | Set system event text and border color.                      |
| setLeftBubbleColor              | Set left bubble chat color (for: Admin, Supervisor, Agent).  |
| setLeftBubbleTextColor          | Set left bubble text color (for: Admin, Supervisor, Agent).  |
| setRightBubbleColor             | Set right bubble chat color (Customer).                      |
| setRightBubbleTextColor         | Set right bubble text color (Customer).                      |
| setTimeLabelTextColor           | Set time text color.                                         |
| setTimeBackgroundColor          | Set time background color.                                   |
| setBaseColor                    | Set background color of the room chat.                       |
| setEmptyTextColor               | Set empty state text color.                                  |
| setEmptyBackgroundColor         | Set empty state background color.                            |

![Color Customization Image](/Readme/colorConfig.png)

## How to Run the Example

1. **Get your APPID**

- Go to [Qiscus Multichannel Chat page](https://multichannel.qiscus.com/) to register your email
- Log in to Qiscus Multichannel Chat with your email and password
- Go to ‘Setting’ menu on the left bar
- Look for ‘App Information’
- You can find APPID in the App Info

2. **Activate Qiscus Widget Integration**

- Go to ‘Integration’ menu on the left bar
- Look for ‘Qiscus Widget’
- Slide the toggle to activate the Qiscus widget

3. **Install the example dependencies**

From the repository root run:

```
yarn install
```

4. **Configure the example**

- Open `example/src/App.tsx`
- Replace the `APP_ID` constant with your App ID and optionally update `CHANNEL_ID`

```javascript
<MultichannelWidgetProvider appId={APP_ID}>
  <App />
</MultichannelWidgetProvider>
```

5. **Run the example app**

From the `example` directory start the Metro bundler with `yarn start`. In another terminal run one of the following:

- `yarn android` to build and install the Expo project on an Android device/emulator.
- `yarn ios` to build and install on the iOS simulator (requires Xcode and CocoaPods).
- `yarn web` to try the widget in a browser.

Once the app launches you can start chatting with the agents that monitor your Qiscus Multichannel Chat dashboard.
