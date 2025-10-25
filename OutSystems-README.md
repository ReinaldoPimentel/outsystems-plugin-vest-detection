# OutSystems Vest Detection Plugin

## Overview
This Cordova plugin provides AI-powered vest detection capabilities for OutSystems Mobile applications using TensorFlow Lite. The plugin analyzes images to detect whether a person is wearing a safety vest.

## Repository Information
- **GitHub URL**: https://github.com/js7vensousa/outsystems-plugin-vest-detection.git
- **Branch**: main
- **Plugin ID**: outsystems-plugin-vest-detection
- **Version**: 1.0.0
- **Author**: João Sousa - Accelerated Focus

## OutSystems Integration

### Extensibility Configuration
Use this configuration in your OutSystems app:

```json
{
  "plugin": {
    "url": "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
  },
  "buildConfigurations": {
    "cordova": {
      "source": {
        "npm": "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
      }
    }
  }
}
```

### Plugin Features
- **detectBase64**: Analyzes base64-encoded images for vest detection
- **warmup**: Preloads the TensorFlow Lite model for faster detection
- **test**: Tests plugin functionality

### JavaScript API
```javascript
// Warm up the model (recommended on app start)
VestDetection.warmup(successCallback, errorCallback);

// Test plugin functionality
VestDetection.test(successCallback, errorCallback);

// Detect vest in image
VestDetection.detectBase64(imageBase64, successCallback, errorCallback);
```

### Detection Result Format
```javascript
{
    vest: boolean,           // True if vest detected
    confidence: number,       // Confidence score (0-1)
    label: string,           // Detected label ("vest" or "no_vest")
    debugLog: string,        // Debug information
    allClassifications: number, // Number of classifications
    testField: string        // Test field for verification
}
```

## Platform Support

### Android
- **Min SDK**: 21
- **Target SDK**: 33
- **Frameworks**: TensorFlow Lite Support Library
- **Permissions**: Camera access
- **Resources**: vest_model.tflite, labels.txt

### iOS
- **Deployment Target**: 11.0
- **Frameworks**: TensorFlowLiteSwift, TensorFlowLiteTaskVision
- **Permissions**: Camera usage description
- **Resources**: vest_model.tflite

## Installation Steps

1. **Add Extensibility Configuration** in Service Studio
2. **Configure Plugin URL**: Use the GitHub repository URL
3. **Build and Deploy** your OutSystems app
4. **Test Plugin** using the provided JavaScript actions

## Usage Example

```javascript
// Complete workflow example
function detectVestInImage(imageBase64) {
    VestDetection.detectBase64(
        imageBase64,
        function(result) {
            console.log('Vest detected:', result.vest);
            console.log('Confidence:', result.confidence);
            console.log('Label:', result.label);
            
            // Update your OutSystems variables
            VestDetected = result.vest;
            Confidence = result.confidence;
            Label = result.label;
            DebugLog = result.debugLog;
        },
        function(error) {
            console.error('Detection failed:', error);
            ErrorCode = error.code || 'DETECTION_FAILED';
            ErrorMessage = error.message || 'Unknown error';
        }
    );
}
```

## Troubleshooting

### Common Issues
1. **Plugin not loaded**: Verify Extensibility Configuration
2. **Model loading fails**: Check if model files are included
3. **Detection returns empty**: Verify image format and size
4. **Performance issues**: Call warmup before detection

### Debug Information
- Check browser console for detailed logs
- Use `debugLog` field for troubleshooting
- Monitor `testField` for plugin connectivity verification

## Support
For issues or questions, check the debug logs and ensure all dependencies are properly configured.

## License
This plugin is provided by João Sousa - Accelerated Focus for OutSystems applications.
