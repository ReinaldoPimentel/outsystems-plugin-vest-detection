// OutSystems Multiple Plugins Integration Example
// Vest Detection + Camera Plugin Workflow

// ============================================================================
// COMPLETE WORKFLOW: Capture Photo + Detect Vest
// ============================================================================
// Purpose: Capture a photo using camera plugin, then detect vest in the image
// Input Variables: None (uses camera)
// Output Variables: VestDetected (Boolean), Confidence (Decimal), Label (Text),
//                   DebugLog (Text), ImageBase64 (Text), ErrorCode (Text), ErrorMessage (Text)

function CapturePhotoAndDetectVest() {
    console.log('Starting complete workflow: Capture + Detect');
    
    // Step 1: Check if both plugins are available
    if (typeof Camera === 'undefined') {
        ErrorCode = 'CAMERA_PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'Camera plugin not loaded';
        console.error('Camera plugin not available');
        return false;
    }
    
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'VEST_PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded';
        console.error('VestDetection plugin not available');
        return false;
    }
    
    // Step 2: Capture photo using camera plugin
    console.log('Capturing photo...');
    
    var cameraOptions = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 800,
        targetHeight: 600,
        correctOrientation: true
    };
    
    Camera.capturePhoto(
        function(imageData) {
            console.log('✅ Photo captured successfully');
            ImageBase64 = imageData;
            
            // Step 3: Detect vest in captured image
            console.log('Analyzing image for vest detection...');
            
            VestDetection.detectBase64(
                imageData,
                function(result) {
                    console.log('✅ Vest detection completed:', result);
                    
                    // Map results to OutSystems variables
                    VestDetected = result.vest || false;
                    Confidence = result.confidence || 0;
                    Label = result.label || '';
                    DebugLog = result.debugLog || '';
                    
                    // Clear error variables
                    ErrorCode = '';
                    ErrorMessage = '';
                    
                    console.log('Complete workflow results:');
                    console.log('- Vest Detected:', VestDetected);
                    console.log('- Confidence:', Confidence);
                    console.log('- Label:', Label);
                },
                function(error) {
                    console.error('❌ Vest detection failed:', error);
                    
                    ErrorCode = 'DETECTION_FAILED';
                    ErrorMessage = error.message || 'Vest detection failed';
                    
                    // Clear result variables
                    VestDetected = false;
                    Confidence = 0;
                    Label = '';
                    DebugLog = '';
                }
            );
        },
        function(error) {
            console.error('❌ Camera capture failed:', error);
            
            ErrorCode = 'CAMERA_FAILED';
            ErrorMessage = error.message || 'Camera capture failed';
            
            // Clear result variables
            VestDetected = false;
            Confidence = 0;
            Label = '';
            DebugLog = '';
            ImageBase64 = '';
        },
        cameraOptions
    );
    
    return true;
}

// ============================================================================
// ALTERNATIVE: Select from Gallery + Detect Vest
// ============================================================================
// Purpose: Select image from gallery, then detect vest
// Input Variables: None
// Output Variables: Same as above

function SelectFromGalleryAndDetectVest() {
    console.log('Starting gallery selection + vest detection workflow');
    
    // Check plugins
    if (typeof Camera === 'undefined' || typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGINS_NOT_AVAILABLE';
        ErrorMessage = 'Required plugins not loaded';
        return false;
    }
    
    var galleryOptions = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 800,
        targetHeight: 600,
        correctOrientation: true
    };
    
    Camera.capturePhoto(
        function(imageData) {
            console.log('✅ Image selected from gallery');
            ImageBase64 = imageData;
            
            // Detect vest
            VestDetection.detectBase64(
                imageData,
                function(result) {
                    console.log('✅ Vest detection completed:', result);
                    
                    VestDetected = result.vest || false;
                    Confidence = result.confidence || 0;
                    Label = result.label || '';
                    DebugLog = result.debugLog || '';
                    
                    ErrorCode = '';
                    ErrorMessage = '';
                },
                function(error) {
                    console.error('❌ Vest detection failed:', error);
                    
                    ErrorCode = 'DETECTION_FAILED';
                    ErrorMessage = error.message || 'Vest detection failed';
                    
                    VestDetected = false;
                    Confidence = 0;
                    Label = '';
                    DebugLog = '';
                }
            );
        },
        function(error) {
            console.error('❌ Gallery selection failed:', error);
            
            ErrorCode = 'GALLERY_FAILED';
            ErrorMessage = error.message || 'Gallery selection failed';
            
            VestDetected = false;
            Confidence = 0;
            Label = '';
            DebugLog = '';
            ImageBase64 = '';
        },
        galleryOptions
    );
    
    return true;
}

// ============================================================================
// PLUGIN STATUS CHECK
// ============================================================================
// Purpose: Check if both plugins are loaded and ready
// Input Variables: None
// Output Variables: CameraAvailable (Boolean), VestDetectionAvailable (Boolean), 
//                   PluginStatus (Text)

function CheckMultiplePluginsStatus() {
    CameraAvailable = typeof Camera !== 'undefined';
    VestDetectionAvailable = typeof VestDetection !== 'undefined';
    
    if (CameraAvailable && VestDetectionAvailable) {
        PluginStatus = 'Both plugins are loaded and ready';
        console.log('✅ Both Camera and VestDetection plugins are available');
    } else if (CameraAvailable && !VestDetectionAvailable) {
        PluginStatus = 'Camera plugin loaded, VestDetection plugin missing';
        console.log('⚠️ Camera available, VestDetection missing');
    } else if (!CameraAvailable && VestDetectionAvailable) {
        PluginStatus = 'VestDetection plugin loaded, Camera plugin missing';
        console.log('⚠️ VestDetection available, Camera missing');
    } else {
        PluginStatus = 'Both plugins are missing';
        console.log('❌ Both plugins are missing');
    }
    
    return true;
}

// ============================================================================
// WARMUP WORKFLOW
// ============================================================================
// Purpose: Warm up both plugins for better performance
// Input Variables: None
// Output Variables: WarmupStatus (Text), ErrorCode (Text), ErrorMessage (Text)

function WarmupMultiplePlugins() {
    WarmupStatus = 'Starting plugin warmup...';
    
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'VEST_PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded';
        WarmupStatus = 'Failed: VestDetection plugin missing';
        return false;
    }
    
    // Warm up VestDetection model
    VestDetection.warmup(
        function(success) {
            console.log('✅ VestDetection model warmed up:', success);
            WarmupStatus = 'VestDetection model warmed up successfully';
            ErrorCode = '';
            ErrorMessage = '';
        },
        function(error) {
            console.error('❌ VestDetection warmup failed:', error);
            ErrorCode = 'WARMUP_FAILED';
            ErrorMessage = error.message || 'Model warmup failed';
            WarmupStatus = 'Failed: ' + ErrorMessage;
        }
    );
    
    return true;
}

// ============================================================================
// USAGE EXAMPLES FOR OUTSYSTEMS
// ============================================================================

/*
EXAMPLE 1: Complete Workflow
1. Create JavaScript action "CapturePhotoAndDetectVest"
2. Set output variables: VestDetected, Confidence, Label, DebugLog, ImageBase64, ErrorCode, ErrorMessage
3. Copy the CapturePhotoAndDetectVest function above
4. Call from client action or screen button

EXAMPLE 2: Gallery Selection
1. Create JavaScript action "SelectFromGalleryAndDetectVest"
2. Set same output variables as above
3. Copy the SelectFromGalleryAndDetectVest function above
4. Call from client action

EXAMPLE 3: Plugin Status Check
1. Create JavaScript action "CheckMultiplePluginsStatus"
2. Set output variables: CameraAvailable, VestDetectionAvailable, PluginStatus
3. Copy the CheckMultiplePluginsStatus function above
4. Call on app start to verify both plugins are loaded

EXAMPLE 4: Warmup
1. Create JavaScript action "WarmupMultiplePlugins"
2. Set output variables: WarmupStatus, ErrorCode, ErrorMessage
3. Copy the WarmupMultiplePlugins function above
4. Call on app start for better performance

TROUBLESHOOTING:
- Check browser console for detailed logs
- Verify both Extensibility Configurations are correct
- Ensure camera permissions are granted
- Test each plugin individually first
- Use CheckMultiplePluginsStatus to verify plugin availability
*/
