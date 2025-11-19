# Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in the React Native Multichannel Widget example app.

> **Reference**: Official React Native Firebase documentation: https://rnfirebase.io/

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Android Setup](#android-setup)
- [iOS Setup](#ios-setup)
- [Implementation](#implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, ensure you have:

1. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. React Native development environment set up
3. Node.js version >= 18
4. For iOS: Xcode and CocoaPods installed
5. For Android: Android Studio and SDK installed

## Installation

### 1. Install Required Packages

The example app already includes the necessary Firebase packages:

```json
"@react-native-firebase/app": "^20.4.0",
"@react-native-firebase/messaging": "^20.4.0",
"@notifee/react-native": "^7.8.1"
```

If you're setting up a new project, install them:

```bash
# Using yarn
yarn add @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native

# Using npm
npm install --save @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
```

> **Note**: `@react-native-firebase/app` must be installed before any other Firebase modules.

## Android Setup

### 1. Generate Android Credentials

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Add app" and select Android
4. Enter your Android package name:
   - Found in `android/app/build.gradle` under `namespace` field
   - For this example: `qiscuscommunity.reactnativemultichannelwidget.example`
5. (Optional) Generate debug signing certificate for Phone Authentication:
   ```bash
   cd android && ./gradlew signingReport
   ```
   Copy both SHA-1 and SHA-256 keys from the `debugAndroidTest` variant
6. Download the `google-services.json` file

### 2. Add Configuration File

Place the downloaded `google-services.json` file in:
```
android/app/google-services.json
```

### 3. Configure Gradle

The example app is already configured, but here's what's needed:

**`android/build.gradle`** (project-level):
```gradle
buildscript {
    dependencies {
        // ... other dependencies
        classpath("com.google.gms:google-services:4.4.2")
    }
}
```

**`android/app/build.gradle`** (app-level):
```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

// ... rest of the file

apply plugin: "com.google.gms.google-services"  // Add at the bottom
```

### 4. Rebuild the App

```bash
npx react-native run-android
```

## iOS Setup

### 1. Generate iOS Credentials

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on "Add app" and select iOS
4. Enter your iOS bundle ID:
   - Found in Xcode under "General" tab
   - For this example: Check your Xcode project settings
5. Download the `GoogleService-Info.plist` file

### 2. Add Configuration File

1. Open your project in Xcode:
   ```bash
   cd ios
   open MyProject.xcworkspace  # or .xcodeproj if not using CocoaPods
   ```
2. Right-click on your project name in Xcode
3. Select "Add Files to [ProjectName]"
4. Select the downloaded `GoogleService-Info.plist` file
5. **Important**: Check "Copy items if needed"

### 3. Configure Firebase SDK

For React Native 0.76+ (using Swift):

**`ios/MyProject/AppDelegate.swift`**:
```swift
import Firebase  // Add this import

override func application(
  _ application: UIApplication,
  didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
) -> Bool {
  FirebaseApp.configure()  // Add this line
  // ... rest of the method
}
```

For React Native < 0.77 (using Objective-C):

**`ios/MyProject/AppDelegate.mm`**:
```objc
#import <Firebase.h>  // Add this import

- (BOOL)application:(UIApplication *)application 
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  [FIRApp configure];  // Add this line
  // ... rest of the method
}
```

### 4. Configure CocoaPods

**`ios/Podfile`**:
```ruby
platform :ios, '13.4'

target 'MyProject' do
  config = use_native_modules!
  
  use_frameworks! :linkage => :static  # Add this line
  $RNFirebaseAsStaticFramework = true  # Add this line

  use_react_native!(
    :path => config[:reactNativePath],
    :hermes_enabled => true
  )
  
  # ... rest of the file
end
```

> **Note**: `use_frameworks!` is not compatible with Flipper. You must disable Flipper by commenting out the `:flipper_configuration` line.

### 5. Install Pods and Rebuild

```bash
cd ios
pod install --repo-update
cd ..
npx react-native run-ios
```

### 6. Enable Push Notifications Capability

1. Open your project in Xcode
2. Select your target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and enable:
   - Remote notifications
   - Background fetch

## Implementation

The example app already implements Firebase Cloud Messaging. Here's how it works:

### 1. Firebase Hook (`src/use-firebase.ts`)

The `useFirebase` hook handles all FCM functionality:

```typescript
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

export function useFirebase() {
  const widget = useMultichannelWidget();

  useEffect(() => {
    const setupFirebase = async () => {
      // Register device for remote messages
      await messaging().registerDeviceForRemoteMessages();
      await notifee.requestPermission();

      // Request FCM permission (iOS)
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
      const unsubscribeOnMessage = messaging().onMessage(
        async (remoteMessage) => {
          console.log('[Firebase] Foreground message received:', remoteMessage);
          await displayRemoteNotification(remoteMessage);
        }
      );

      // Handle notification opened app from background
      const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
        (remoteMessage) => {
          console.log('[Firebase] Notification opened app:', remoteMessage);
        }
      );

      // Check if app was opened from notification (quit state)
      messaging()
        .getInitialNotification()
        .then((remoteMessage) => {
          if (remoteMessage) {
            console.log('[Firebase] App opened from notification:', remoteMessage);
          }
        });

      // Handle token refresh
      const unsubscribeTokenRefresh = messaging().onTokenRefresh((newToken) => {
        console.log('[Firebase] Token refreshed:', newToken);
        widget.setDeviceId?.(newToken);
      });

      return () => {
        unsubscribeOnMessage?.();
        unsubscribeNotificationOpened?.();
        unsubscribeTokenRefresh?.();
      };
    };

    setupFirebase();
  }, [widget]);
}
```

### 2. Notification Display (`src/notifications.ts`)

The notification handler uses Notifee for displaying notifications:

```typescript
import notifee, { AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'qiscus-channel';

async function ensureChannel(): Promise<string> {
  return await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Qiscus Notifications',
    description: 'Notifications for Qiscus chat messages',
    importance: AndroidImportance.HIGH,
    vibration: true,
  });
}

export async function displayRemoteNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
): Promise<void> {
  await ensureChannel();

  const payload = parsePayload(remoteMessage.data?.payload);
  const title = remoteMessage.notification?.title ?? payload?.title ?? 'New Message';
  const body = remoteMessage.notification?.body ?? payload?.message ?? '';

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data ?? undefined,
    android: {
      channelId: CHANNEL_ID,
      smallIcon: 'ic_launcher',
      pressAction: { id: 'default' },
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
```

### 3. Integration in App (`src/App.tsx`)

The hook is called in the main App component:

```typescript
function App() {
  useFirebase();  // Initialize Firebase
  
  // ... rest of your app
}
```

## Testing

### 1. Get FCM Token

Run your app and check the logs for the FCM token:

```
[Firebase] FCM Token: <your-token-here>
```

### 2. Send Test Notification

Use Firebase Console to send a test notification:

1. Go to Firebase Console > Cloud Messaging
2. Click "Send your first message"
3. Enter notification title and text
4. Click "Send test message"
5. Paste your FCM token
6. Click "Test"

### 3. Test Different States

Test notifications in different app states:

- **Foreground**: App is open and active
  - Notification should be displayed using Notifee
  - `onMessage` handler is called
  
- **Background**: App is in background
  - System displays notification
  - `onNotificationOpenedApp` is called when tapped
  
- **Quit**: App is completely closed
  - System displays notification
  - `getInitialNotification` returns the notification when app opens

## Troubleshooting

### Android Issues

**Problem**: Notifications not received
- Ensure `google-services.json` is in the correct location
- Check that Google Play Services is installed on the device/emulator
- Verify the package name matches in Firebase Console and `build.gradle`
- Check logcat for Firebase errors: `adb logcat | grep Firebase`

**Problem**: Build errors
- Clean the build: `cd android && ./gradlew clean && cd ..`
- Ensure Google Services plugin version is compatible: `4.4.2`

### iOS Issues

**Problem**: Notifications not received on iOS
- Ensure `GoogleService-Info.plist` is added to Xcode project
- Check that Push Notifications capability is enabled
- Verify Bundle ID matches in Firebase Console and Xcode
- iOS Simulator does NOT support push notifications - use a real device

**Problem**: Pod install fails
- Update CocoaPods: `sudo gem install cocoapods`
- Update pod repo: `pod repo update`
- Try: `cd ios && pod deintegrate && pod install`

**Problem**: Flipper conflicts
- Comment out Flipper configuration in Podfile
- Flipper is not compatible with `use_frameworks!`

### General Issues

**Problem**: Token not generated
- Check internet connection
- Ensure Firebase is properly initialized
- Check for permission issues in device settings

**Problem**: Background messages not working
- Ensure message priority is set to `high` (Android)
- Ensure `content-available` is set to `true` (iOS)
- Check that background handler is registered before any messages arrive

## Additional Resources

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Notifee Documentation](https://notifee.app/)
- [React Native Firebase Messaging](https://rnfirebase.io/messaging/usage)
- [iOS Setup Guide](https://rnfirebase.io/messaging/usage/ios-setup)

## Support

For issues specific to this widget, please check:
- [Widget Documentation](../docs/GETTING_STARTED.md)
- [GitHub Issues](https://github.com/qiscus-community/react-native-multichannel-widget/issues)

For Firebase-specific issues:
- [React Native Firebase Discord](https://discord.gg/C9aK28N)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native-firebase)