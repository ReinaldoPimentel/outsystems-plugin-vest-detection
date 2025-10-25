# OutSystems CheckVest Action Troubleshooting

## 🔍 Problem: CheckVest returns empty variables

You said:
- ✅ CheckVest_Plugin identifies plugin is available
- ❌ CheckVest returns nothing in output variables

## 🎯 Most Likely Causes:

### 1. **OutSystems Action Not Handling Callback** ⚠️
The plugin uses **asynchronous callbacks**. Your OutSystems action must handle the callback properly.

**Check**: Is your `CheckVest` action a **JavaScript action** that handles success/error callbacks?

### 2. **Variable Mapping Incorrect** ⚠️
The output variables might not be mapped to the plugin's return object.

**Plugin returns**:
```json
{
  "label": "vest",
  "confidence": 0.95,
  "vest": true,
  "debugLog": "...",
  "allClassifications": 2,
  "testField": "Android callback working"
}
```

**Your OutSystems variables must be**:
- `Label` (Text) ← `result.label`
- `Confidence` (Decimal) ← `result.confidence`
- `VestDetected` (Boolean) ← `result.vest`
- `DebugLog` (Text) ← `result.debugLog`
- `AllClassifications` (Integer) ← `result.allClassifications`
- `TestField` (Text) ← `result.testField`

### 3. **Error is Silent** ⚠️
The error callback might be firing but not captured.

## 🛠️ Solution: Create Proper OutSystems JavaScript Action

### In OutSystems Studio:

1. **Create JavaScript Action**: `CheckVest`
2. **Input Variables**:
   - `ImageBase64` (Text) - Input image
3. **Output Variables**:
   - `Label` (Text)
   - `Confidence` (Decimal)
   - `VestDetected` (Boolean)
   - `DebugLog` (Text)
   - `ErrorCode` (Text)
   - `ErrorMessage` (Text)

### Copy this EXACT code:

```javascript
// CheckVest JavaScript Action for OutSystems

// Validate inputs
if (!ImageBase64 || ImageBase64.length === 0) {
    ErrorCode = 'INVALID_INPUT';
    ErrorMessage = 'ImageBase64 is required';
    console.error('CheckVest: No image provided');
    return false;
}

// Check if plugin is available
if (typeof VestDetection === 'undefined') {
    ErrorCode = 'PLUGIN_NOT_AVAILABLE';
    ErrorMessage = 'VestDetection plugin not loaded';
    console.error('CheckVest: Plugin not available');
    return false;
}

console.log('CheckVest: Starting detection with image length:', ImageBase64.length);

// Call the plugin
VestDetection.detectBase64(
    ImageBase64,
    // SUCCESS callback
    function(result) {
        console.log('CheckVest: SUCCESS - Received result:', result);
        
        // Map plugin result to OutSystems variables
        Label = result.label || '';
        Confidence = result.confidence || 0;
        VestDetected = result.vest || false;
        DebugLog = result.debugLog || '';
        AllClassifications = result.allClassifications || 0;
        TestField = result.testField || '';
        
        // Clear error variables
        ErrorCode = '';
        ErrorMessage = '';
        
        console.log('CheckVest: Variables mapped');
        console.log('- Label:', Label);
        console.log('- Confidence:', Confidence);
        console.log('- VestDetected:', VestDetected);
    },
    // ERROR callback
    function(error) {
        console.error('CheckVest: ERROR - Received error:', error);
        
        // Set error variables
        if (typeof error === 'object') {
            ErrorCode = error.code || 'DETECTION_FAILED';
            ErrorMessage = error.message || JSON.stringify(error);
            DebugLog = error.debugLog || '';
        } else {
            ErrorCode = 'DETECTION_FAILED';
            ErrorMessage = error || 'Unknown error';
        }
        
        // Clear result variables
        Label = '';
        Confidence = 0;
        VestDetected = false;
        AllClassifications = 0;
        TestField = '';
        
        console.error('CheckVest: Error captured');
    }
);

console.log('CheckVest: Call made, waiting for callback');
return true;
```

## 📋 Critical Points:

1. **Variables must be declared** as Output in the JavaScript action
2. **Callback must be handled** in the JavaScript action (not in flow)
3. **Check device logs** for console.log messages
4. **Error handling** must capture both success and error

## 🔍 Debug Steps:

### Step 1: Add Logging to Your Flow
Add an **Assign** step after `CheckVest`:
```
DebugLogCheck = DebugLog
ErrorCodeCheck = ErrorCode
LabelCheck = Label
```

### Step 2: Check Device Console
Connect device via USB debugging and check Chrome DevTools console for:
- "CheckVest: Starting detection..."
- "CheckVest: SUCCESS..." or "CheckVest: ERROR..."

### Step 3: Verify Variable Types
Ensure output variables match these types:
- `Label` → **Text**
- `Confidence` → **Decimal**
- `VestDetected` → **Boolean**
- `DebugLog` → **Text**
- `ErrorCode` → **Text**
- `ErrorMessage` → **Text**

## ⚠️ Most Common Mistake:

**Don't call the plugin like this** (Synchronous - WON'T WORK):
```javascript
var result = VestDetection.detectBase64(ImageBase64); // ❌ WRONG!
```

**Must use callbacks** (Asynchronous - CORRECT):
```javascript
VestDetection.detectBase64(ImageBase64, successCallback, errorCallback); // ✅ CORRECT!
```

## 🎯 Next Steps:

1. **Replace your CheckVest action** with the code above
2. **Ensure all variables are declared** as Output
3. **Test the action**
4. **Check device console** for logs
5. **Report what DebugLog contains**

The DebugLog variable will show EXACTLY where the failure occurs!
