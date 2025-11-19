# Getting Started

This guide walks through the exact steps to run the bundled Expo example and experiment with `@qiscus-community/react-native-multichannel-widget` without needing prior knowledge of the project.

## 1. Prerequisites

| Tool | Recommended version | Notes |
| --- | --- | --- |
| Node.js | 18 LTS or newer (Expo 52 requires ≥18) | Install via [Node installers](https://nodejs.org/) or `nvm`. |
| Yarn | 3.6 (repo uses Yarn Berry) | Enable via `corepack enable` once Node is installed. |
| Java Development Kit | 17 | Needed for the Android build. Install via Temurin or Android Studio. |
| Android Studio & SDK tools | Latest stable | Required for `yarn android`. Make sure an emulator and SDK 34+ are installed. |
| Xcode & CocoaPods | Xcode 15, CocoaPods 1.14+ | Only needed for building the iOS example. |
| Watchman (macOS) | Optional but recommended | Improves Metro bundler performance. |

## 2. Clone and Install

```bash
git clone https://github.com/apiep/react-native-multichannel-widget.git
cd react-native-multichannel-widget
corepack enable          # ensures Yarn 3 is available
yarn install             # installs root + example dependencies
```

> Tip: If you edit the library code inside `src`, run `yarn prepare` to rebuild the distributable files consumed by the example app.

> ⚠️ The repo is pinned to **Yarn 3 (Berry)** through `packageManager`. Stick to `yarn` commands—running `npm install` or `npx` in the root will rewrite lockfiles and frequently break the example workspace.

## 3. Yarn Workflow Cheat Sheet

| Command | Run inside | Why it matters |
| --- | --- | --- |
| `yarn install` | Repo root | Installs every workspace (library + example) with the pinned Yarn version. Re-run after pulling new changes or installing extra dev tools. |
| `yarn prepare` | Repo root | Builds the library via `react-native-builder-bob` so the example consumes your latest edits. Required any time you change files in `src/`, `android/`, or `ios/`. |
| `yarn test` / `yarn lint` / `yarn typecheck` | Repo root | Quickly validate your changes before publishing or pushing. |
| `cd example && yarn install` | `example/` (only if prompted) | The workspace shares dependencies from the root install, but if Expo asks for missing packages, install them here with `yarn`, never `npm`. |
| `cd example && yarn start` / `yarn android` / `yarn ios` | `example/` | Boots the Expo bundler or runs native builds. These commands expect the root install + any recent `yarn prepare` run. |

Having a mental map of where to run each `yarn` command saves time and avoids accidentally mixing package managers.

## 4. Retrieve Your Qiscus Credentials

1. Sign in to [Qiscus Multichannel Chat](https://multichannel.qiscus.com/).
2. Open **Settings → App Information** and copy the `APP_ID`.
3. (Optional) Navigate to **Integration → Qiscus Widget** to activate the widget and grab a specific `CHANNEL_ID` if you plan to target a non-default widget channel.

## 5. Configure the Example App

1. Open `example/src/App.tsx`.
2. Replace the `APP_ID` constant (and `CHANNEL_ID` if desired) with the values taken from the dashboard.
3. Save the file—no additional configuration files are required.

The example already sets up `MultichannelWidgetProvider`, login, and chat components; you only need to inject valid credentials.

## 6. Run the Example with Expo

```bash
cd example
yarn start         # starts the Metro bundler (keep it running)
```

In a separate terminal choose one of:

- `yarn android` – builds and runs on an Android emulator/device via `expo run:android`
- `yarn ios` – builds and runs on the iOS simulator via `expo run:ios`
- `yarn web` – opens the widget inside a browser (useful for quick UI checks)

Expo will prompt you to select the target if multiple devices are detected. When the app launches, enter any `userId`/`displayName` pair and tap the login button to start the conversation with your agents on the Qiscus dashboard.

## 7. Common Tasks

- **Clear Metro cache** – Run `yarn start --reset-cache` inside `example` if the bundler serves stale code.
- **Update native dependencies** – After changing native code (inside `android`/`ios` folders of the library), re-run `yarn install` followed by `yarn example ios|android` to regenerate native builds.
- **Testing the library** – From the repo root run `yarn test` (Jest), `yarn lint`, or `yarn typecheck` before publishing.

## 8. Troubleshooting

- `Command yarn android fails with SDK errors` – Make sure Android Studio has downloaded the latest Platform Tools and that `ANDROID_HOME` is set.
- `CocoaPods cannot find dependencies` – Run `sudo gem install cocoapods` once, then `npx pod-install` under `example/ios`.
- `initiateChat throws appId error` – Double-check your `APP_ID` and ensure the widget integration toggle is enabled in Qiscus.
- `Example does not reflect local package changes` – Run `yarn prepare` from the root to rebuild the library before reloading the app.

You should now have a fully working playground to explore the widget, tweak configuration APIs, and verify the user experience before integrating it into your own app.
