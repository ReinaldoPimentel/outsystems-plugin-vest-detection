# OutSystems Vest Detection Plugin

TensorFlow Lite-based vest detection plugin for OutSystems Mobile applications.

## Repository Structure

### Plugin Files (For ODC Integration)
- `plugin.xml` - Cordova plugin configuration
- `www/VestDetection.js` - JavaScript interface
- `src/android/` - Android native implementation
- `src/ios/` - iOS native implementation  
- `src/models/` - TensorFlow Lite model files
- `package.json` - Package configuration

### Documentation (For Reference)
- `docs/` - All documentation and integration guides
  - OutSystems integration guides
  - JavaScript action examples
  - Extensibility configurations
  - Troubleshooting guides

### Demo App (For Testing)
- `VestDetectionTestApp/` - Cordova test application
  - Browser-based testing interface
  - Mock plugin implementation for browser testing
  - Not required for ODC production use

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
VestDetection.detectBase64(imageBase64, successCallback, errorCallback);
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

## Documentation

See `docs/` directory for:
- Integration guides
- JavaScript action examples
- Troubleshooting
- Configuration examples

## License

Created by João Sousa - Accelerated Focus
