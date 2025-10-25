# OutSystems Plugin Integration Checklist

## ❗ CRITICAL: Plugin Not Working - Diagnostic Steps

### Step 1: Verify Plugin Files in Repository ✅
```bash
# Check if these files exist in your GitHub repo:
- plugin.xml (in root)
- www/VestDetection.js (in root/www/)
- src/android/VestDetectionPlugin.java
- src/ios/VestDetectionPlugin.m
- src/models/vest_model.tflite
- src/models/labels.txt
- package.json (in root)
```

### Step 2: OutSystems Extensibility Configuration ⚠️

**IMPORTANT**: The JSON configuration you showed earlier was **incomplete**!

**Current incorrect configuration:**
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

**The issue**: OutSystems needs a **proper Cordova plugin structure**!

### Step 3: Check Repository Structure

Your repository must have this structure:
```
outsystems-plugin-vest-detection/
├── plugin.xml              (MUST be in root)
├── www/
│   └── VestDetection.js   (MUST be in www/)
├── src/
│   ├── android/
│   │   └── VestDetectionPlugin.java
│   ├── ios/
│   │   ├── VestDetectionPlugin.h
│   │   └── VestDetectionPlugin.m
│   └── models/
│       ├── vest_model.tflite
│       └── labels.txt
└── package.json
```

### Step 4: Verify GitHub Repository

**Check your GitHub repository:**
1. Go to: https://github.com/js7vensousa/outsystems-plugin-vest-detection
2. Verify ALL files are present at the root level
3. Check the `main` branch
4. Ensure `www/` folder exists with `VestDetection.js` inside

### Step 5: Correct OutSystems Configuration

**In Service Studio, use this configuration:**

#### Method 1: Direct URL (Simplest)
```
Plugin URL: https://github.com/js7vensousa/outsystems-plugin-vest-detection.git
Branch/Version: main
Platforms: Android, iOS
```

#### Method 2: With Build Configuration (If Method 1 doesn't work)
```json
{
  "extensibilityConfigurations": [
    {
      "name": "VestDetection",
      "pluginId": "outsystems-plugin-vest-detection",
      "version": "1.0.0",
      "url": "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
    }
  ],
  "buildConfigurations": {
    "cordova": {
      "plugins": [
        "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
      ]
    }
  }
}
```

### Step 6: Debug Plugin Loading

**Add this JavaScript in your OutSystems app:**

```javascript
// Check if plugin is loaded
function CheckPluginLoaded() {
    console.log('Checking for VestDetection plugin...');
    
    // Check if Cordova is ready
    if (typeof cordova === 'undefined') {
        console.error('Cordova is not loaded');
        return false;
    }
    
    console.log('Cordova is loaded');
    
    // Check if VestDetection is available
    if (typeof VestDetection === 'undefined') {
        console.error('VestDetection plugin is NOT loaded');
        console.log('Available plugins:', cordova.require('cordova/plugin_list'));
        return false;
    }
    
    console.log('✅ VestDetection plugin is loaded');
    console.log('Available methods:', Object.keys(VestDetection));
    return true;
}

// Call this after device ready
document.addEventListener('deviceready', function() {
    console.log('Device ready event fired');
    CheckPluginLoaded();
}, false);

// Also check immediately
CheckPluginLoaded();
```

### Step 7: Common Issues

#### Issue 1: Plugin files not in repository root
**Solution**: Ensure `www/VestDetection.js` is at the ROOT of your GitHub repo, not in a subdirectory

#### Issue 2: Wrong branch or commit
**Solution**: Use `#main` or `#master` tag in the URL

#### Issue 3: Build configuration incorrect
**Solution**: The plugin needs to be in the `buildConfigurations.cordova.plugins` array

#### Issue 4: Plugin not downloading
**Solution**: Check build logs in Service Center for download errors

### Step 8: Rebuild and Deploy

1. **Clean Build**: Clear previous builds
2. **Delete old builds**: Remove existing mobile builds
3. **Create new build**: Generate new mobile build
4. **Check build logs**: Look for plugin download messages
5. **Install on device**: Test on actual device (not just simulator

### Step 9: Verify Plugin is Actually Loading

**Add this in your OutSystems JavaScript action:**

```javascript
// Log all available Cordova objects
console.log('Cordova:', typeof cordova);
console.log('VestDetection:', typeof VestDetection);
console.log('Available window objects:', Object.keys(window));
```

### Step 10: Check Build Logs

**In Service Center, check:**
1. Go to **Monitoring** → **Logs**
2. Filter for your mobile app
3. Look for messages like:
   - "Installing plugin: outsystems-plugin-vest-detection"
   - "Downloading plugin from: https://github.com..."
   - Any errors related to plugin installation

## 🎯 Most Likely Issues:

1. **Files not in correct location in GitHub repo** ⚠️
2. **Wrong Extensibility Configuration format** ⚠️
3. **Plugin not downloading during build** ⚠️
4. **Need to rebuild app from scratch** ⚠️

## ✅ Quick Fix Steps:

1. Verify file structure in GitHub repo
2. Use simple Extensibility Configuration (Method 1)
3. Clean build and redeploy
4. Check build logs for errors
5. Test on device (not browser simulator)
