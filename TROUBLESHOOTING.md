# Troubleshooting: "Class not found" Error

## Error
```
Failed to initialize the mode: Class not found
```

## Problem Analysis

This error occurs when the Android runtime cannot find the `VestDetectionPlugin` class. This is typically caused by:

1. **Package/Class Mismatch**: The Java package doesn't match what Cordova expects
2. **Missing Class File**: The .java file wasn't compiled or copied to the APK
3. **Wrong Feature Name**: The feature name in plugin.xml doesn't match

## Solution

The issue is in how the plugin is registered. Let me check the current configuration:

### Current Configuration (plugin.xml):
```xml
<feature name="VestDetection">
    <param name="android-package" value="com.outsystems.vest.VestDetectionPlugin" />
</feature>
```

### The Problem

When using `<feature>` tag with a package parameter, Cordova expects the class to match exactly. The issue might be:

1. The class needs to extend `CordovaPlugin` ✓ (it does)
2. The package needs to match exactly ✓ (it does)
3. But the feature name might not match the expected convention

## Fix: Update plugin.xml

The feature name should ideally match the plugin ID or be explicitly defined:

```xml
<feature name="VestDetection">
    <param name="android-package" value="com.outsystems.vest.VestDetectionPlugin" />
</feature>
```

This looks correct. Let's try a different approach - checking if we need to update how the class is registered.

## Alternative: Check if this is a ProGuard issue

If the app is being built in Release mode, ProGuard might be obfuscating the class name. Add this to `platforms/android/app/proguard-rules.pro`:

```proguard
-keep class com.outsystems.vest.VestDetectionPlugin { *; }
-keep class com.outsystems.vest.** { *; }
```

## Debugging Steps

1. **Check if the class is in the APK:**
   ```bash
   # Extract APK
   unzip app-debug.apk -d extracted
   
   # Find the class file
   find . -name "VestDetectionPlugin.class"
   ```

2. **Check LogCat for errors:**
   ```bash
   adb logcat | grep VestDetection
   ```

3. **Verify the class is being loaded:**
   Look for:
   ```
   VestDetection: loadModel: Starting model load
   ```

## Potential Fix: Update plugin.xml Feature Name

Try changing the feature name to match the plugin ID:

```xml
<feature name="outsystems-plugin-vest-detection">
    <param name="android-package" value="com.outsystems.vest.VestDetectionPlugin" />
</feature>
```

Or ensure the JavaScript module name matches:

```xml
<js-module src="www/VestDetection.js" name="VestDetection">
    <clobbers target="VestDetection" />
</js-module>
```

The module name must match what you call from JavaScript:
```javascript
VestDetection.warmup(...)  // Must match 'VestDetection'
```

## Verification

After making changes:
1. Clean and rebuild the app
2. Check that `VestDetectionPlugin.class` exists in the APK
3. Test the warmup() method first

