# OutSystems Vest Detection Plugin

TensorFlow Lite-based vest detection plugin for OutSystems Mobile applications.

## Repository Structure

This repository contains the **plugin source code** for OutSystems Mobile applications.

### Plugin Files
- `plugin.xml` - Cordova plugin configuration
- `www/VestDetection.js` - JavaScript interface
- `src/android/` - Android native implementation (VestDetectionPlugin.java, ImageUtils.java)
- `src/ios/` - iOS native implementation (VestDetectionPlugin.h, VestDetectionPlugin.m)
- `src/models/` - TensorFlow Lite model files (vest_model.tflite, labels.txt)
- `package.json` - Plugin package configuration

## Quick Start for OutSystems

1. **Add Extensibility Configuration** in Service Studio
   ```
   URL: https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main
   ```
2. **Build** your mobile app in ODC
3. **Install** on device and test

## Usage

### JavaScript API
```javascript
// Warm up the model (recommended for faster first detection)
VestDetection.warmup(
    function(success) {
        console.log('Model loaded:', success);
    },
    function(error) {
        console.error('Error:', error);
    }
);

// Detect vest in base64 image
VestDetection.detectBase64(
    imageBase64,
    function(result) {
        console.log('Vest detected:', result.vest);
        console.log('Confidence:', result.confidence);
        console.log('Label:', result.label);
    },
    function(error) {
        console.error('Detection error:', error);
    }
);
```

### Return Value
```javascript
{
  label: "vest",
  confidence: 0.95,
  vest: true,
  debugLog: "...",
  allClassifications: 2
}
```

## Installation

### Method 1: Direct GitHub Integration (Recommended)

In OutSystems Service Studio:
1. Go to **Mobile** → **Extensibility**
2. Add new configuration with:
   ```
   URL: https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main
   ```
3. Build your mobile app in ODC
4. Install and test on device

### Method 2: Manual Installation

Download or clone this repository and reference it locally.

## Requirements

- OutSystems Mobile 11+
- Cordova 9.0+
- Android API 24+ (Android 7.0+)
- iOS 12.0+
- TensorFlow Lite 2.14.0 (Android)
- TensorFlow Lite TaskVision 2.14.0 (iOS)

## API Reference

### Methods

#### `warmup(successCallback, errorCallback)`
Pre-loads the TensorFlow Lite model for faster first detection.

#### `detectBase64(imageBase64, successCallback, errorCallback)`
Detects a vest in a base64-encoded image.

**Parameters:**
- `imageBase64` (String) - Base64-encoded image string

**Returns:**
```javascript
{
  label: "vest" | "no_vest",
  confidence: 0.95,
  vest: true,
  debugLog: "...",
  allClassifications: 2
}
```

## License

MIT - Created by João Sousa - Accelerated Focus

