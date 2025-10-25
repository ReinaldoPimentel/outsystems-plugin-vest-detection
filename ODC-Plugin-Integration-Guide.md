# OutSystems ODC (OutSystems Developer Cloud) - Plugin Integration

## ⚠️ Important: ODC vs OS11 Differences

**OutSystems Developer Cloud (ODC)** has a different Extensibility Configuration format than OS11!

### ODC Extensibility Configuration Format

#### For Mobile Apps in ODC:

ODC uses a **simpler configuration** for Cordova plugins:

```json
{
  "pluginId": "outsystems-plugin-vest-detection",
  "version": "1.0.0",
  "source": "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
}
```

### Steps in ODC:

1. **Open your Mobile App** in ODC
2. **Go to**: App Settings → Extensibility
3. **Add Plugin** button
4. **Configure**:
   - **Plugin ID**: `outsystems-plugin-vest-detection`
   - **Version**: `1.0.0`
   - **Source**: `https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main`
   - **Platforms**: Select `Android` and `iOS`

### Alternative: Direct Git URL (ODC Style)

ODC might also support simpler Git URL format:

```json
{
  "plugins": [
    "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main"
  ]
}
```

## 🔧 ODC Mobile App Steps

### Step 1: Add Plugin in ODC
1. Open **Studio** (ODC version)
2. Go to your **Mobile App**
3. Navigate to **App** → **Properties**
4. Find **Extensibility** section
5. Click **Add Plugin** or similar

### Step 2: Configure Plugin
- **Plugin ID**: `outsystems-plugin-vest-detection`
- **Version**: `1.0.0`  
- **Source Type**: Git Repository
- **URL**: `https://github.com/js7vensousa/outsystems-plugin-vest-detection.git`
- **Branch/Tag**: `main`

### Step 3: Save and Build
1. **Save** the configuration
2. **Publish** the app
3. **Build** mobile app in ODC portal
4. **Download** and install on device

## 📱 Important: Plugin Only Works in Mobile App (Not Browser)

Since you're using ODC, remember:
- ✅ Plugin works in **Mobile App builds**
- ✅ Plugin works on **real devices**
- ❌ Plugin does **NOT** work in **Browser**
- ❌ Plugin does **NOT** work in **Reactive Web Apps**

### Testing Workflow:
1. Create Mobile App in ODC
2. Add Extensibility Configuration
3. Publish and build
4. Install on Android/iOS device
5. Test plugin functionality

## 🎯 ODC-Specific Configuration

### If ODC uses JSON Editor:

```json
{
  "extensibility": {
    "plugins": [
      {
        "id": "outsystems-plugin-vest-detection",
        "url": "https://github.com/js7vensousa/outsystems-plugin-vest-detection.git",
        "version": "1.0.0"
      }
    ]
  }
}
```

### If ODC uses Form-Based UI:
- Just enter the Git URL: `https://github.com/js7vensousa/outsystems-plugin-vest-detection.git#main`
- Select platforms: Android, iOS
- Version: `1.0.0`

## ✅ ODC Checklist

- [ ] You're working in a **Mobile App** (not Reactive Web)
- [ ] Plugin configuration saved in ODC
- [ ] App is published
- [ ] Mobile build generated successfully
- [ ] Build log shows plugin downloaded
- [ ] App installed on device (not browser)
- [ ] Testing on real device

## 🚨 Troubleshooting in ODC

### Issue: "Plugin not found"
**Solution**: 
- Verify Git URL is public and accessible
- Check branch name (`main` vs `master`)
- Ensure repository structure is correct

### Issue: "Build fails"
**Solution**:
- Check ODC build logs
- Look for plugin download errors
- Verify TensorFlow Lite dependencies are compatible

### Issue: "Plugin loads but not working"
**Solution**:
- Test on real device (not emulator/simulator)
- Check device permissions (camera access)
- Review device console logs
- Verify native code compiled correctly

## 📞 ODC Support

If issues persist:
1. Check **ODC build logs** for specific errors
2. Verify plugin files are in correct location in GitHub
3. Test with simple plugin first (like Camera plugin)
4. Contact ODC support with build logs

## 🎯 Quick Test Code for ODC Mobile App

```javascript
// Add to your Mobile App screen

function TestVestDetection() {
    // Wait for device ready
    document.addEventListener('deviceready', function() {
        console.log('Device ready - testing plugin');
        
        if (typeof VestDetection === 'undefined') {
            console.error('❌ VestDetection plugin not loaded');
            alert('Plugin not loaded. Check Extensibility Configuration.');
            return;
        }
        
        console.log('✅ Plugin loaded');
        
        // Test warmup
        VestDetection.warmup(
            function(success) {
                console.log('✅ Plugin works!', success);
                alert('Plugin working: ' + success);
            },
            function(error) {
                console.error('Plugin error:', error);
            }
        );
    }, false);
}

// Run test when screen loads
TestVestDetection();
```

Remember: This code must run in **Mobile App on device**, not in browser!
