// OutSystems Vest Detection Plugin - JavaScript Actions
// Copy these functions into your OutSystems JavaScript actions

// ============================================================================
// ACTION 1: WarmupVestDetectionModel
// ============================================================================
// Purpose: Preload the TensorFlow Lite model for faster detection
// Input Variables: None
// Output Variables: ErrorCode (Text), ErrorMessage (Text)

function WarmupVestDetectionModel() {
    // Check if plugin is available
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded. Please check Extensibility Configuration.';
        console.error('VestDetection plugin not available');
        return false;
    }
    
    console.log('Starting model warmup...');
    
    VestDetection.warmup(
        function(success) {
            console.log('✅ Model warmed up successfully:', success);
            ErrorCode = '';
            ErrorMessage = '';
        },
        function(error) {
            console.error('❌ Warmup failed:', error);
            ErrorCode = 'WARMUP_FAILED';
            ErrorMessage = error.message || 'Model warmup failed';
        }
    );
    
    return true;
}

// ============================================================================
// ACTION 2: TestVestDetectionPlugin
// ============================================================================
// Purpose: Test basic plugin functionality
// Input Variables: None
// Output Variables: TestResult (Text), ErrorCode (Text), ErrorMessage (Text)

function TestVestDetectionPlugin() {
    // Check if plugin is available
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded. Please check Extensibility Configuration.';
        TestResult = '';
        console.error('VestDetection plugin not available');
        return false;
    }
    
    console.log('Testing VestDetection plugin...');
    
    VestDetection.test(
        function(result) {
            console.log('✅ Plugin test successful:', result);
            TestResult = result;
            ErrorCode = '';
            ErrorMessage = '';
        },
        function(error) {
            console.error('❌ Plugin test failed:', error);
            TestResult = '';
            ErrorCode = 'TEST_FAILED';
            ErrorMessage = error.message || 'Plugin test failed';
        }
    );
    
    return true;
}

// ============================================================================
// ACTION 3: DetectVestInImage
// ============================================================================
// Purpose: Detect vest in base64-encoded image
// Input Variables: ImageBase64 (Text)
// Output Variables: VestDetected (Boolean), Confidence (Decimal), Label (Text), 
//                   DebugLog (Text), AllClassifications (Integer), TestField (Text),
//                   ErrorCode (Text), ErrorMessage (Text)

function DetectVestInImage() {
    // Check if plugin is available
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded. Please check Extensibility Configuration.';
        VestDetected = false;
        Confidence = 0;
        Label = '';
        DebugLog = '';
        AllClassifications = 0;
        TestField = '';
        console.error('VestDetection plugin not available');
        return false;
    }
    
    // Validate input
    if (!ImageBase64 || ImageBase64.length === 0) {
        ErrorCode = 'INVALID_INPUT';
        ErrorMessage = 'No image provided. ImageBase64 variable is empty.';
        VestDetected = false;
        Confidence = 0;
        Label = '';
        DebugLog = '';
        AllClassifications = 0;
        TestField = '';
        console.error('No image provided for detection');
        return false;
    }
    
    // Validate base64 format (basic check)
    if (!ImageBase64.startsWith('data:image/') && !ImageBase64.match(/^[A-Za-z0-9+/=]+$/)) {
        ErrorCode = 'INVALID_FORMAT';
        ErrorMessage = 'Invalid image format. Please provide base64-encoded image.';
        VestDetected = false;
        Confidence = 0;
        Label = '';
        DebugLog = '';
        AllClassifications = 0;
        TestField = '';
        console.error('Invalid image format provided');
        return false;
    }
    
    console.log('Starting vest detection for image length:', ImageBase64.length);
    
    VestDetection.detectBase64(
        ImageBase64,
        function(result) {
            console.log('✅ Vest detection completed successfully:', result);
            
            // Map results to OutSystems variables
            VestDetected = result.vest || false;
            Confidence = result.confidence || 0;
            Label = result.label || '';
            DebugLog = result.debugLog || '';
            AllClassifications = result.allClassifications || 0;
            TestField = result.testField || '';
            
            // Clear error variables
            ErrorCode = '';
            ErrorMessage = '';
            
            // Log results
            console.log('Detection Results:');
            console.log('- Vest Detected:', VestDetected);
            console.log('- Confidence:', Confidence);
            console.log('- Label:', Label);
            console.log('- Debug Log:', DebugLog);
        },
        function(error) {
            console.error('❌ Vest detection failed:', error);
            
            // Set error variables
            ErrorCode = error.code || 'DETECTION_FAILED';
            ErrorMessage = error.message || 'Unknown error occurred during detection';
            
            // Clear result variables
            VestDetected = false;
            Confidence = 0;
            Label = '';
            DebugLog = '';
            AllClassifications = 0;
            TestField = '';
        }
    );
    
    return true;
}

// ============================================================================
// ACTION 4: CheckVestDetectionPluginStatus
// ============================================================================
// Purpose: Check if the plugin is loaded and ready
// Input Variables: None
// Output Variables: PluginAvailable (Boolean), PluginStatus (Text)

function CheckVestDetectionPluginStatus() {
    if (typeof VestDetection !== 'undefined') {
        PluginAvailable = true;
        PluginStatus = 'VestDetection plugin is loaded and ready';
        console.log('✅ VestDetection plugin is available');
    } else {
        PluginAvailable = false;
        PluginStatus = 'VestDetection plugin is not loaded. Check Extensibility Configuration.';
        console.error('❌ VestDetection plugin is not available');
    }
    
    return true;
}

// ============================================================================
// ACTION 5: ProcessImageWithVestDetection
// ============================================================================
// Purpose: Complete workflow - warmup, test, and detect vest
// Input Variables: ImageBase64 (Text)
// Output Variables: VestDetected (Boolean), Confidence (Decimal), Label (Text),
//                   DebugLog (Text), AllClassifications (Integer), TestField (Text),
//                   ErrorCode (Text), ErrorMessage (Text), WorkflowStatus (Text)

function ProcessImageWithVestDetection() {
    WorkflowStatus = 'Starting vest detection workflow...';
    
    // Step 1: Check plugin availability
    if (typeof VestDetection === 'undefined') {
        ErrorCode = 'PLUGIN_NOT_AVAILABLE';
        ErrorMessage = 'VestDetection plugin not loaded. Please check Extensibility Configuration.';
        WorkflowStatus = 'Failed: Plugin not available';
        return false;
    }
    
    // Step 2: Validate input
    if (!ImageBase64 || ImageBase64.length === 0) {
        ErrorCode = 'INVALID_INPUT';
        ErrorMessage = 'No image provided. ImageBase64 variable is empty.';
        WorkflowStatus = 'Failed: No image provided';
        return false;
    }
    
    WorkflowStatus = 'Plugin available, starting detection...';
    
    // Step 3: Perform detection
    VestDetection.detectBase64(
        ImageBase64,
        function(result) {
            console.log('✅ Complete workflow successful:', result);
            
            // Map results
            VestDetected = result.vest || false;
            Confidence = result.confidence || 0;
            Label = result.label || '';
            DebugLog = result.debugLog || '';
            AllClassifications = result.allClassifications || 0;
            TestField = result.testField || '';
            
            // Clear errors
            ErrorCode = '';
            ErrorMessage = '';
            WorkflowStatus = 'Completed successfully';
            
            console.log('Workflow Results:');
            console.log('- Vest Detected:', VestDetected);
            console.log('- Confidence:', Confidence);
            console.log('- Label:', Label);
        },
        function(error) {
            console.error('❌ Complete workflow failed:', error);
            
            ErrorCode = error.code || 'WORKFLOW_FAILED';
            ErrorMessage = error.message || 'Unknown error in workflow';
            WorkflowStatus = 'Failed: ' + ErrorMessage;
            
            // Clear results
            VestDetected = false;
            Confidence = 0;
            Label = '';
            DebugLog = '';
            AllClassifications = 0;
            TestField = '';
        }
    );
    
    return true;
}

// ============================================================================
// USAGE EXAMPLES FOR OUTSYSTEMS
// ============================================================================

/*
EXAMPLE 1: Basic Detection Flow
1. Create JavaScript action "DetectVestInImage"
2. Set input variable: ImageBase64 (Text)
3. Set output variables: VestDetected (Boolean), Confidence (Decimal), etc.
4. Copy the DetectVestInImage function above
5. Call from client action or screen

EXAMPLE 2: Complete Workflow
1. Create JavaScript action "ProcessImageWithVestDetection"
2. Set input variable: ImageBase64 (Text)
3. Set output variables: All result variables
4. Copy the ProcessImageWithVestDetection function above
5. Call from client action

EXAMPLE 3: Plugin Status Check
1. Create JavaScript action "CheckVestDetectionPluginStatus"
2. Set output variables: PluginAvailable (Boolean), PluginStatus (Text)
3. Copy the CheckVestDetectionPluginStatus function above
4. Call on app start to verify plugin is loaded

EXAMPLE 4: Model Warmup
1. Create JavaScript action "WarmupVestDetectionModel"
2. Set output variables: ErrorCode (Text), ErrorMessage (Text)
3. Copy the WarmupVestDetectionModel function above
4. Call on app start for better performance

TROUBLESHOOTING:
- Check browser console for detailed logs
- Verify Extensibility Configuration is correct
- Ensure ImageBase64 contains valid base64 image data
- Test with warmup action first
- Use test action to verify basic functionality
*/
