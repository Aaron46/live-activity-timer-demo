# Expo + iOS Live Activities Setup

A concise, repeatable checklist for integrating Live Activities into an Expo (React Native) app.

## Prerequisites
- iOS 16.1+ (test on a real device when possible), Xcode 15+
- Expo SDK 53+, Development Client (not Expo Go)

## App configuration
- `app.json`:
```json
{
  "expo": {
    "ios": {
      "deploymentTarget": "16.1",
      "infoPlist": {
        "NSSupportsLiveActivities": true,
        "NSSupportsLiveActivitiesFrequentUpdates": true
      },
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.<your.bundle>"
        ]
      },
      "bundleIdentifier": "com.example.yourapp",
      "appleTeamId": "<TEAMID>"
    }
  }
}
```
- Ensure the bundle identifier and Team ID match your Apple Developer settings.

## iOS project and CocoaPods
- `ios/Podfile`:
```ruby
platform :ios, '16.1'
use_expo_modules!
```
- Run after native/config changes:
```sh
pod install
npx expo run:ios
```
- Set `IPHONEOS_DEPLOYMENT_TARGET` to `16.1` for the app and all extensions in Xcode.
- Verify `ios/Podfile.lock` lists your native module and `ExpoModulesCore`.

## Expo Modules native module
- `modules/<your-module>/expo-module.config.json`:
```json
{
  "name": "@your/live-activity",
  "platforms": ["ios"],
  "ios": { "modules": ["LiveActivityModule"] }
}
```
- `modules/<your-module>/ios/<Name>.podspec`:
```ruby
s.platforms = { :ios => '16.1' }
s.static_framework = true
s.dependency 'ExpoModulesCore'
s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
```
- Swift module skeleton (`LiveActivityModule.swift`):
```swift
import ExpoModulesCore
import ActivityKit

public class LiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LiveActivity")
    // AsyncFunction("startActivity") { ... }
    // AsyncFunction("updateActivity") { ... }
    // AsyncFunction("endActivity") { ... }
  }
}
```
- Use `@available(iOS 16.1, *)` around ActivityKit code.

### JS bridge usage
```ts
import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

function getNative(): any | null {
  if (Platform.OS !== 'ios') return null;
  try { return requireNativeModule('LiveActivity'); } catch { return null; }
}

export async function startActivity(name: string) {
  const Native = getNative();
  return Native ? Native.startActivity(name) : null;
}
```

## Widget extension (UI for Lock Screen / Dynamic Island)
- Create a widget target (manually or via `@bacons/apple-targets`).
- Link frameworks: `ActivityKit`, `WidgetKit`, `SwiftUI`, `AppIntents`.
- Implement `ActivityConfiguration` views for minimal/compact/expanded.
- Share the same `ActivityAttributes` type between app and widget.
- Ensure the widget target uses the same Application Group entitlement.

## Capability checks & UX
- Swift capability check exposed to JS:
```swift
import ActivityKit

@available(iOS 16.1, *)
func areLiveActivitiesEnabled() -> Bool {
  ActivityAuthorizationInfo().areActivitiesEnabled
}
```
- In JS, disable UI when `getNative()` is null or capability is false.

## Optional: Remote/live push updates
- For server-driven updates, request push tokens from `Activity` and send APNs with `push-type: liveactivity`.
- Configure Push Notifications and required background modes.

## Autolinking and verification
- Ensure your module is detected: `npx expo-modules-autolinking verify --platform ios`
- After pods install, `ExpoModulesProvider.swift` (under `ios/Pods/...`) should include your module.

## Common pitfalls
- Mixed deployment targets (< 16.1) between Podfile and Xcode targets.
- Forgetting to `pod install` or rebuild the dev client after native changes.
- Expecting Expo Go to load custom native modules (it won’t).
- Application Group mismatch between app and widget.
- Duplicated, out-of-sync `ActivityAttributes` between app and widget.

## Quick checklist
- [ ] iOS deployment target 16.1 in `app.json`, Podfile, and Xcode targets
- [ ] Live Activities Info.plist keys present
- [ ] App Group entitlement shared across app and widget
- [ ] Native module (Expo Module) with ActivityKit APIs in Swift
- [ ] Widget target implemented and signed
- [ ] `pod install` then `npx expo run:ios`
- [ ] Test on a real device; verify Lock Screen/Dynamic Island
