# Qiscus Multichannel Widget Example

This example app demonstrates how to use `@qiscus-community/react-native-multichannel-widget` inside a pure React Native 0.76 project.

## Project Structure
```
example/
├── src/                    # App source code
│   ├── App.tsx            # Root component
│   ├── hooks/             # Custom hooks
│   ├── components/        # UI components
│   └── utils/             # Helpers
├── android/               # Native Android project
├── ios/                   # Native iOS project
├── index.js               # Entry point (registers App)
├── app.json               # App metadata
├── metro.config.js        # Metro bundler config
├── babel.config.js        # Babel config
├── tsconfig.json          # TypeScript config
├── jest.config.js         # Jest setup
```

## Requirements
- Node.js 18+
- Yarn or npm
- Xcode (for iOS)
- Android Studio (for Android)

## Setup
```bash
cd example
yarn install

# iOS only
yarn pod-install
```

## Running
```bash
# Start Metro bundler
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios
```

## Configuration

### Qiscus Credentials
Update `src/App.tsx` with your credentials:
```ts
export const APP_ID = 'YOUR_APP_ID';
export const CHANNEL_ID = 'YOUR_CHANNEL_ID';
```

### Firebase + Notifee (Optional)
For push notifications, follow the [Firebase Setup Guide](./FIREBASE_SETUP.md).  
The example uses `@notifee/react-native` for both foreground and background notification display.

Once configured, enable Firebase in `src/App.tsx`:
```ts
function App() {
  useFirebase(); // Uncomment this line
  // ...
}
```

## Testing
```bash
yarn test
```

## Linting & Formatting
```bash
yarn lint
```

## Features

- ✅ Pure React Native 0.76 (no Expo)
- ✅ TypeScript support
- ✅ Qiscus Multichannel Widget integration
- ✅ Firebase Cloud Messaging + Notifee notifications (optional)
