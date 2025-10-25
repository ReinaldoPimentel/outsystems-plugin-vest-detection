# OutSystems Vest Detection Plugin - Integration Guide

## Overview
This guide explains how to integrate the Vest Detection plugin into OutSystems Mobile applications.

## Plugin Features
- **detectBase64**: Analyzes base64-encoded images for vest detection
- **warmup**: Preloads the TensorFlow Lite model for faster detection
- **test**: Tests plugin functionality

## OutSystems Integration Steps

### 1. Add Plugin to OutSystems App

#### Method 1: Extensibility Configurations (Recommended)
1. In Service Studio, go to **App > Extensibility Configurations**
2. Click **New Extensibility Configuration**
3. Configure:
   - **Name**: `VestDetection`
   - **Plugin ID**: `outsystems-plugin-vest-detection`
   - **Version**: `1.0.0`
   - **Platforms**: Android, iOS

#### Method 2: Manual Plugin Installation
1. Download the plugin files
2. Add to your OutSystems app's plugin directory
3. Update `config.xml` to include the plugin

### 2. JavaScript Integration

#### Basic Usage
```javascript
// Wait for device ready
document.addEventListener('deviceready', function() {
    console.log('Device ready - VestDetection available');
}, false);

// Warm up the model (recommended on app start)
function warmupModel() {
    VestDetection.warmup(
        function(success) {
            console.log('Model warmed up:', success);
        },
        function(error) {
            console.error('Warmup failed:', error);
        }
    );
}

// Test plugin functionality
function testPlugin() {
    VestDetection.test(
        function(result) {
            console.log('Plugin test result:', result);
        },
        function(error) {
            console.error('Plugin test failed:', error);
        }
    );
}

// Detect vest in image
function detectVest(imageBase64) {
    VestDetection.detectBase64(
        imageBase64,
        function(result) {
            console.log('Detection result:', result);
            
            // Process results
            var vestDetected = result.vest;
            var confidence = result.confidence;
            var label = result.label;
            var debugLog = result.debugLog;
            
            // Update UI based on results
            if (vestDetected) {
                console.log('Vest detected with confidence:', confidence);
            } else {
                console.log('No vest detected');
            }
        },
        function(error) {
            console.error('Detection failed:', error);
        }
    );
}
```

#### Advanced Integration with OutSystems Actions
```javascript
// Create OutSystems action wrapper
function VestDetectionAction(imageBase64) {
    return new Promise((resolve, reject) => {
        VestDetection.detectBase64(
            imageBase64,
            function(result) {
                resolve({
                    VestDetected: result.vest,
                    Confidence: result.confidence,
                    Label: result.label,
                    DebugLog: result.debugLog,
                    AllClassifications: result.allClassifications,
                    TestField: result.testField
                });
            },
            function(error) {
                reject({
                    ErrorCode: error.code || 'UNKNOWN_ERROR',
                    ErrorMessage: error.message || 'Detection failed'
                });
            }
        );
    });
}

// Usage in OutSystems
async function processImage(imageBase64) {
    try {
        const result = await VestDetectionAction(imageBase64);
        
        // Update OutSystems variables
        VestDetected = result.VestDetected;
        Confidence = result.Confidence;
        Label = result.Label;
        DebugLog = result.DebugLog;
        
        return true;
    } catch (error) {
        console.error('Vest detection error:', error);
        ErrorCode = error.ErrorCode;
        ErrorMessage = error.ErrorMessage;
        return false;
    }
}
```

### 3. OutSystems Variables Mapping

#### Input Variables
- `ImageBase64` (Text) - Base64 encoded image string

#### Output Variables
- `VestDetected` (Boolean) - True if vest is detected
- `Confidence` (Decimal) - Confidence score (0.0 to 1.0)
- `Label` (Text) - Detected label ("vest" or "no_vest")
- `DebugLog` (Text) - Debug information
- `AllClassifications` (Integer) - Number of classifications
- `TestField` (Text) - Test field for verification

#### Error Variables
- `ErrorCode` (Text) - Error code if detection fails
- `ErrorMessage` (Text) - Error message if detection fails

### 4. Complete OutSystems Integration Example

```javascript
// OutSystems JavaScript action
function DetectVestInImage() {
    // Check if plugin is available
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded';
        return false;
    }
    
    // Validate input
    if (!ImageBase64 || ImageBase64.length === 0) {
        ErrorCode = 'INVALID_INPUT';
        ErrorMessage = 'No image provided';
        return false;
    }
    
    // Perform detection
    VestDetection.detectBase64(
        ImageBase64,
        function(result) {
            // Success - map results to OutSystems variables
            VestDetected = result.vest;
            Confidence = result.confidence;
            Label = result.label;
            DebugLog = result.debugLog;
            AllClassifications = result.allClassifications;
            TestField = result.testField;
            
            // Clear error variables
            ErrorCode = '';
            ErrorMessage = '';
            
            console.log('Vest detection completed successfully');
        },
        function(error) {
            // Error - set error variables
            ErrorCode = error.code || 'DETECTION_FAILED';
            ErrorMessage = error.message || 'Unknown error occurred';
            
            // Clear result variables
            VestDetected = false;
            Confidence = 0;
            Label = '';
            DebugLog = '';
            AllClassifications = 0;
            TestField = '';
            
            console.error('Vest detection failed:', error);
        }
    );
    
    return true;
}

// Warmup action for OutSystems
function WarmupVestDetectionModel() {
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded';
        return false;
    }
    
    VestDetection.warmup(
        function(success) {
            console.log('Model warmed up successfully:', success);
            ErrorCode = '';
            ErrorMessage = '';
        },
        function(error) {
            ErrorCode = 'WARMUP_FAILED';
            ErrorMessage = error.message || 'Model warmup failed';
            console.error('Warmup failed:', error);
        }
    );
    
    return true;
}
```

### 5. OutSystems App Configuration

#### Required Permissions
The plugin automatically requests camera permissions. Ensure your OutSystems app has:
- Camera permission (Android)
- Camera usage description (iOS)

#### App Preferences
```json
{
  "preferences": {
    "global": [
      {
        "name": "orientation",
        "value": "portrait"
      }
    ]
  }
}
```

### 6. Testing in OutSystems

#### Test Sequence
1. **Warmup Test**: Call warmup action on app start
2. **Plugin Test**: Test basic plugin functionality
3. **Detection Test**: Test with sample images
4. **Error Handling**: Test with invalid inputs

#### Debug Information
- Check browser console for detailed logs
- Use `DebugLog` variable for troubleshooting
- Monitor `TestField` for plugin connectivity verification

### 7. Troubleshooting

#### Common Issues
1. **Plugin not loaded**: Ensure Extensibility Configuration is correct
2. **Model loading fails**: Check if model files are included
3. **Detection returns empty**: Verify image format and size
4. **Performance issues**: Call warmup before detection

#### Debug Steps
1. Check console logs for error messages
2. Verify plugin is loaded: `typeof VestDetection !== 'undefined'`
3. Test with warmup action first
4. Use test action to verify basic functionality

## Plugin API Reference

### VestDetection.warmup(success, error)
Preloads the TensorFlow Lite model for faster detection.

**Parameters:**
- `success` (Function): Called on successful warmup
- `error` (Function): Called on warmup failure

### VestDetection.test(success, error)
Tests plugin functionality.

**Parameters:**
- `success` (Function): Called with test result
- `error` (Function): Called on test failure

### VestDetection.detectBase64(imageBase64, success, error)
Detects vest in base64-encoded image.

**Parameters:**
- `imageBase64` (String): Base64 encoded image
- `success` (Function): Called with detection result
- `error` (Function): Called on detection failure

**Success Result:**
```javascript
{
    vest: boolean,           // True if vest detected
    confidence: number,       // Confidence score (0-1)
    label: string,           // Detected label
    debugLog: string,        // Debug information
    allClassifications: number, // Number of classifications
    testField: string        // Test field
}
```

## Support
For issues or questions, check the debug logs and ensure all dependencies are properly configured.
