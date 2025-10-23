# Karpeles iOS App

A simple iOS application that displays the Karpeles.com website in a WebView.

## Features

- Displays www.Karpeles.com in a native iOS WebView (WKWebView)
- Loading progress indicator
- Support for back/forward navigation gestures
- Works on both iPhone and iPad
- Supports both portrait and landscape orientations

## Requirements

- Xcode 14.0 or later
- iOS 13.0 or later
- Swift 5.0

## Installation

1. Open `KarpelesApp.xcodeproj` in Xcode
2. Select your target device or simulator
3. Click the Run button (or press Cmd+R)

## Project Structure

```
KarpelesApp/
├── KarpelesApp.xcodeproj/     # Xcode project file
└── KarpelesApp/
    ├── AppDelegate.swift      # App lifecycle management
    ├── ViewController.swift   # Main view controller with WebView
    ├── Info.plist            # App configuration
    ├── Assets.xcassets/      # App icons and images
    └── Base.lproj/
        └── LaunchScreen.storyboard  # Launch screen
```

## Configuration

The app is configured to load `https://www.karpeles.com` by default. To change the URL, modify the URL string in `ViewController.swift`:

```swift
if let url = URL(string: "https://www.karpeles.com") {
    let request = URLRequest(url: url)
    webView.load(request)
}
```

## Bundle Identifier

The app uses the bundle identifier: `com.karpeles.KarpelesApp`

You may need to change this in the Xcode project settings to match your Apple Developer account.

## App Transport Security

The app has App Transport Security disabled to allow loading web content. This is configured in `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## Building for Release

1. Open the project in Xcode
2. Select "Any iOS Device" as the build target
3. Go to Product > Archive
4. Follow the prompts to submit to the App Store or export for ad-hoc distribution

## License

This is a simple wrapper app for www.Karpeles.com
