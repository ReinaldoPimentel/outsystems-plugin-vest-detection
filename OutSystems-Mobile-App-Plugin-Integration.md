# OutSystems Mobile App Plugin Integration - Correct Steps

## ✅ Correct OutSystems Configuration for Mobile App

Since Cordova plugins only work in mobile apps (not browser), here's the correct way to configure:

### In Service Studio (Mobile App):

1. **Open your Mobile App**
   - NOT a Reactive Web App
   - MUST be a Mobile App

2. **Go to**: Mobile App → App → Extensibility Configurations

3. **Add Configuration**:
   - **Name**: `VestDetection`
   - **Plugin ID**: `outsystems-plugin-vest-detection`
   - **Source**: `https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main`
   - **Version**: `1.0.0`
   - **Platforms**: Select `Android` and `iOS`

### JSON Configuration (if using JSON editor):

```json
{
  "extensibilityConfigurations": [
    {
      "name": "VestDetection",
      "pluginId": "outsystems-plugin-vest-detection",
      "version": "1.0.0",
      "url": "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
    }
  ]
}
```

## 🔧 Critical Steps for Mobile App Plugin

### Step 1: Verify Mobile App Type
- ✅ Is it a **Mobile App** (not Reactive Web)?
- ✅ Can you generate **Android/iOS builds**?

### Step 2: Check Build Logs
In Service Center:
1. Go to **Mobile Apps** → Your App
2. Click **Build Logs**
3. Look for messages like:
   - `Installing plugin: outsystems-plugin-vest-detection`
   - `Downloading plugin from: https://github.com...`
   - Any errors about plugin installation

### Step 3: Generate New Build
**IMPORTANT**: After adding Extensibility Configuration:
1. **Publish** your app
2. **Generate** new Mobile Build
3. **Download** the build
4. **Install** on device or emulator

### Step 4: Test on Device
The plugin will ONLY work on:
- ✅ **Real Android/iOS device**
- ✅ **Android/iOS emulator**
- ❌ **NOT in browser**

### Step 5: Add Diagnostic Code in Mobile App

Add this **JavaScript action** in your Mobile App (not browser):

```javascript
function CheckVestDetectionPlugin() {
    // Wait for device ready (REQUIRED for Cordova)
    if (document.readyState === 'complete') {
        TestPlugin();
    } else {
        document.addEventListener('deviceready', TestPlugin, false);
    }
}

function TestPlugin() {
    console.log('=== VEST DETECTION PLUGIN DIAGNOSTIC ===');
    console.log('1. Check Cordova:', typeof cordova !== 'undefined');
    console.log('2. Check VestDetection:', typeof VestDetection !== 'undefined');
    
    if (typeof VestDetection === 'undefined') {
        console.error('❌ VestDetection plugin not loaded!');
        Alert('VestDetection plugin not loaded. Check Extensibility Configuration.');
        return false;
    }
    
    console.log('✅ VestDetection plugin is loaded');
    console.log('Available methods:', Object.keys(VestDetection));
    
    // Test the plugin
    VestDetection.test(
        function(result) {
            console.log('✅ Plugin test successful:', result);
            Alert('Plugin is working: ' + result);
        },
        function(error) {
            console.error('❌ Plugin test failed:', error);
            Alert('Plugin test failed: ' + JSON.stringify(error));
        }
    );
    
    return true;
}

// Auto-run when screen loads
if (typeof CheckVestDetectionPlugin === 'function') {
    CheckVestDetectionPlugin();
}
```

## 🎯 Mobile App Specific Checklist

### ✅ Before Building:
- [ ] Extensibility Configuration added in Mobile App (not Reactive Web)
- [ ] Plugin URL is correct: `https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main`
- [ ] Android and iOS platforms are enabled
- [ ] App is published

### ✅ After Building:
- [ ] Check build logs for plugin download messages
- [ ] Look for any plugin installation errors
- [ ] Generate new mobile build
- [ ] Download and install on device

### ✅ Testing on Device:
- [ ] Run on real Android device
- [ ] Run on real iOS device  
- [ ] Check browser console (inspect via USB debugging)
- [ ] Verify `VestDetection` object exists
- [ ] Test plugin methods (warmup, test, detectBase64)

## 🚨 Common Issues in Mobile Apps

### Issue 1: Plugin Not in Build
**Symptom**: Build completes but plugin not available

**Fix**:
- Check Extensibility Configuration was saved
- Publish app before building
- Generate new build after configuration changes
- Check build logs for plugin download

### Issue 2: Plugin Downloaded But Not Available
**Symptom**: Build log shows plugin downloaded but `VestDetection` undefined

**Fix**:
- Check `plugin.xml` has correct `<js-module>` entry
- Verify `www/VestDetection.js` exists in repository
- Rebuild app from scratch (clean build)

### Issue 3: Methods Not Working
**Symptom**: Plugin loads but methods fail

**Fix**:
- Check native code compilation (Android/iOS)
- Verify TensorFlow Lite dependencies
- Check device permissions (camera)
- Look at device console for native errors

## 📱 Testing Workflow

### 1. Preparation:
```
Service Studio → Mobile App → Add Extensibility Config
→ Save → Publish
```

### 2. Build:
```
Service Center → Mobile App → Generate Build
→ Wait for completion → Check logs
```

### 3. Install:
```
Download build → Install on device
→ Open app → Navigate to screen with plugin
```

### 4. Debug:
```
Connect device to computer
→ Enable USB debugging
→ Use Chrome DevTools (chrome://inspect)
→ View console logs
```

## 🎯 Quick Test in Mobile App

**Create a simple screen with this button:**

```javascript
// Button OnClick event
function TestVestDetectionPlugin() {
    // Check if device ready (Cordova only works on mobile device)
    if (document.readyState !== 'complete') {
        // Wait for device ready
        document.addEventListener('deviceready', function() {
            RunTest();
        });
    } else {
        RunTest();
    }
}

function RunTest() {
    if (typeof VestDetection === 'undefined') {
        console.error('VestDetection plugin not loaded!');
        // Show message to user
        return;
    }
    
    // Try warmup
    VestDetection.warmup(
        function(result) {
            console.log('Warmup successful:', result);
        },
        function(error) {
            console.error('Warmup failed:', error);
        }
    );
}
```

## ✅ Next Steps:

1. **Verify** you're working in a **Mobile App** (not Reactive Web)
2. **Add** Extensibility Configuration as shown above
3. **Publish** and **build** your mobile app
4. **Install** on device and test
5. **Check** browser console via USB debugging

The plugin will ONLY work in the installed mobile app on device, not in browser!
