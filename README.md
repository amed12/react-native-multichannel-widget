# [Widget] Documentation React Native

## Requirements

- ReactNative: ^0.63.4

## Dependency

| Package | Required | Notes |
|---|---|---|
| `@react-native-async-storage/async-storage` | ✅ Yes | Session persistence |
| `react-native-svg` | ✅ Yes | Icons |
| Any file/image picker | ✅ Yes | **Bring your own** — see [File Picker](#file-picker) |
| `react-native-document-picker` | ❌ No | One option among many |

## Installation

```sh
# Qiscus Multichannel main package
yarn add @qiscus-community/react-native-multichannel-widget

# Required peer dependencies
yarn add @react-native-async-storage/async-storage react-native-svg

# Add your preferred file/image picker (examples below)
yarn add react-native-document-picker   # option A
# — or —
yarn add expo-document-picker           # option B
# — or — any library that can return { uri, type, name }
```

For contributor and maintainer workflow (workspace setup, example app, lint/test/release), see [CONTRIBUTING.md](./CONTRIBUTING.md).

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

## File Picker

`MultichannelWidget` does **not** depend on any specific file picker library.
You must provide two async callbacks — `pickImage` and `pickDocument` — that open
your preferred picker and return a `PickedFile` object:

```ts
type PickedFile = {
  uri: string;        // local file URI (use fileCopyUri when available)
  type: string | null; // MIME type, e.g. "image/jpeg"
  name: string | null; // filename with extension
};
```

Pass the callbacks as props to `<MultichannelWidget>`:

```tsx
import {
  MultichannelWidget,
  type FilePicker,
} from '@qiscus-community/react-native-multichannel-widget';

// ── Example A: react-native-document-picker ──────────────────────────────────
import Picker from 'react-native-document-picker';

const pickImage: FilePicker = async () => {
  const r = await Picker.pickSingle({ type: Picker.types.images, copyTo: 'cachesDirectory' });
  return { uri: r.fileCopyUri ?? r.uri, type: r.type ?? null, name: r.name ?? null };
};

const pickDocument: FilePicker = async () => {
  const r = await Picker.pickSingle({ type: Picker.types.allFiles, copyTo: 'cachesDirectory' });
  return { uri: r.fileCopyUri ?? r.uri, type: r.type ?? null, name: r.name ?? null };
};

// ── Example B: expo-document-picker ──────────────────────────────────────────
import * as ExpoDocPicker from 'expo-document-picker';

const pickImage: FilePicker = async () => {
  const r = await ExpoDocPicker.getDocumentAsync({ type: 'image/*', copyToCacheDirectory: true });
  if (r.canceled) return null;
  const asset = r.assets[0];
  return { uri: asset.uri, type: asset.mimeType ?? null, name: asset.name ?? null };
};

const pickDocument: FilePicker = async () => {
  const r = await ExpoDocPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (r.canceled) return null;
  const asset = r.assets[0];
  return { uri: asset.uri, type: asset.mimeType ?? null, name: asset.name ?? null };
};

// ── Usage ─────────────────────────────────────────────────────────────────────
<MultichannelWidget
  onBack={handleBack}
  pickImage={pickImage}
  pickDocument={pickDocument}
/>
```

> Return `null` (or let the promise reject) if the user cancels the picker — the widget handles both gracefully.

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

## Development: Run the Example App

Use these steps when developing this library locally.

1. **Install dependencies (workspace root)**

```sh
corepack yarn install
```

2. **Get your APP_ID**

- Go to [Qiscus Multichannel Chat page](https://multichannel.qiscus.com/) and sign in
- Open `Setting` -> `App Information`
- Copy your `APP_ID`

3. **Activate Qiscus Widget Integration**

- Open `Integration` in Qiscus dashboard
- Enable `Qiscus Widget`

4. **Set `APP_ID` in example app**

- Open `example/src/App.tsx`
- Replace `APP_ID` with your app ID

5. **Start Metro (terminal 1, repo root)**

```sh
corepack yarn example:metro
```

6. **Run app target (terminal 2, repo root)**

```sh
# Android
corepack yarn example:android

# iOS
corepack yarn example:ios

# Web
corepack yarn example:web
```

Optional Android device selection:

```sh
corepack yarn example:android -- --device
```

### Troubleshooting

- `sh: expo: command not found`: install dependencies first with `corepack yarn install`, then run scripts from repository root.
- `No version is set for command yarn`: use `corepack yarn ...` instead of plain `yarn`.
- Native code change is not reflected: rerun `corepack yarn example:android` or `corepack yarn example:ios` to rebuild native app.

## Library Maintenance (Maintainers)

Run all commands from repository root:

```sh
corepack yarn typecheck
corepack yarn lint
corepack yarn test
corepack yarn prepare
```

For contribution, release, and commit rules, see [CONTRIBUTING.md](./CONTRIBUTING.md).
