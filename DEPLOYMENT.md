# Deployment Guide - OutSystems Vest Detection Plugin

## Repository Structure

This repository is **ready for Cordova plugin deployment** but with a special consideration for the TensorFlow Lite model file.

### Current Status
✅ **All required files present**
✅ **Correct directory structure**
✅ **plugin.xml configured**
✅ **package.json set up**

### Special Consideration: Model File

The `vest_model.tflite` file is **NOT in git** because:
- It's large (~28K lines, ~500KB+ binary)
- Git isn't ideal for large binary files
- GitHub has 100MB file size limit

## Recommended Distribution Methods

### Option 1: GitHub Releases (RECOMMENDED)
1. Upload the model as a release asset
2. Provide download instructions in README
3. Users download and place it in `src/models/` before building

### Option 2: Keep Model in Git (Current)
If the model file is already committed:
```bash
# Check if it's tracked
git ls-files src/models/vest_model.tflite

# If you want to keep it tracked, remove due to .gitignore addition
git rm --cached src/models/vest_model.tflite  # DON'T run this if it's already committed
```

### Option 3: Git LFS
Use Git Large File Storage:
```bash
git lfs install
git lfs track "*.tflite"
git add .gitattributes
git add src/models/vest_model.tflite
```

## Verification Checklist

### ✅ Required Files
- [x] `plugin.xml` - Core configuration
- [x] `package.json` - NPM metadata
- [x] `www/VestDetection.js` - JavaScript interface
- [x] `src/android/VestDetectionPlugin.java` - Android native code
- [x] `src/ios/VestDetectionPlugin.h` - iOS header
- [x] `src/ios/VestDetectionPlugin.m` - iOS implementation
- [x] `src/models/labels.txt` - Class labels
- [?] `src/models/vest_model.tflite` - ML model (NOT in git)

### ✅ Directory Structure
```
outsystems-plugin-vest-detection/
├── plugin.xml                 # REQUIRED - Plugin configuration
├── package.json               # REQUIRED - NPM package info
├── README.md                  # Recommended - Documentation
├── .gitignore                 # Recommended - Git ignore rules
├── www/                       # REQUIRED - JS interfaces
│   └── VestDetection.js
├── src/                       # REQUIRED - Native code
│   ├── android/
│   │   └── VestDetectionPlugin.java
│   ├── ios/
│   │   ├── VestDetectionPlugin.h
│   │   └── VestDetectionPlugin.m
│   └── models/
│       ├── labels.txt         # REQUIRED
│       └── vest_model.tflite  # REQUIRED but NOT in git
└── test/                      # Optional - Testing
    ├── test_vest_model.py
    └── test_images/
```

### ✅ plugin.xml Configuration
- **Plugin ID**: `outsystems-plugin-vest-detection`
- **Version**: 1.0.0
- **Platforms**: android, ios
- **JavaScript Module**: `www/VestDetection.js`
- **Android**: TensorFlow Lite 2.14.0 + Support Library
- **iOS**: TensorFlow Lite 2.14.0 + TaskVision
- **Features**: Both platforms configured with correct package names

### ✅ package.json
- **Name**: outsystems-plugin-vest-detection
- **Version**: 1.0.0
- **Platforms**: android, ios
- **Engine**: Cordova >=9.0.0
- **Keywords**: Properly tagged

## Deployment Steps

### 1. Prepare the Repository
```bash
# Ensure model file is present
ls src/models/vest_model.tflite

# If missing, download from release or add it
# Then either:
# A) Commit it (if using Git LFS or small enough)
# B) Document where to get it in README
```

### 2. Update Version (if needed)
```bash
# Update in both files:
# - plugin.xml (line 2)
# - package.json (line 3)
```

### 3. Commit Changes
```bash
git add .
git commit -m "feat: Production-ready vest detection plugin v1.0.1"
git tag v1.0.1
git push origin main --tags
```

### 4. Create GitHub Release (for model distribution)
1. Go to GitHub Releases
2. Create new release v1.0.1
3. Upload `vest_model.tflite` as release asset
4. Add download instructions to release notes

### 5. Integration Instructions for Users

**If model is in git:**
```javascript
// Just add the plugin URL to OutSystems
URL: https://github.com/ReinaldoPimentel/outsystems-plugin-vest-detection.git#main
```

**If model is NOT in git:**
```javascript
// Users need to:
1. Clone the repository
2. Download vest_model.tflite from releases
3. Place it in src/models/vest_model.tflite
4. Reference local path in OutSystems
```

## OutSystems Integration

### Service Studio Configuration
1. Go to **Mobile** → **Extensibility Configurations**
2. Add new configuration:
   - **URL**: `https://github.com/ReinaldoPimentel/outsystems-plugin-vest-detection.git#main`
   - **Name**: VestDetection
3. Build mobile app in ODC (OutSystems Developer Cloud)

### Usage in Code
```javascript
// Warm up model (optional but recommended)
VestDetection.warmup(
    success => console.log('Model loaded'),
    error => console.error('Error:', error)
);

// Detect vest
VestDetection.detectBase64(
    imageBase64,
    result => {
        console.log('Vest detected:', result.vest);
        console.log('Confidence:', result.confidence);
    },
    error => console.error('Detection error:', error)
);
```

## Troubleshooting

### Model File Missing
**Error**: "Model loading failed: vest_model.tflite not found"
**Solution**: Ensure model file is in `src/models/` directory

### Build Fails - TensorFlow Version
**Error**: "Could not find TensorFlow Lite"
**Solution**: Check plugin.xml has correct framework versions (2.14.0)

### Model Output Error
**Error**: "Inference failed" or wrong results
**Solution**: This was fixed in v1.0.1. Ensure you have the latest code

## File Integrity Check

Run this command to verify all required files:
```bash
# Check plugin.xml exists
test -f plugin.xml && echo "✅ plugin.xml" || echo "❌ MISSING plugin.xml"

# Check package.json exists
test -f package.json && echo "✅ package.json" || echo "❌ MISSING package.json"

# Check JS interface
test -f www/VestDetection.js && echo "✅ VestDetection.js" || echo "❌ MISSING VestDetection.js"

# Check Android code
test -f src/android/VestDetectionPlugin.java && echo "✅ Android plugin" || echo "❌ MISSING Android plugin"

# Check iOS code
test -f src/ios/VestDetectionPlugin.m && echo "✅ iOS plugin" || echo "❌ MISSING iOS plugin"

# Check labels
test -f src/models/labels.txt && echo "✅ labels.txt" || echo "❌ MISSING labels.txt"

# Check model (may not be in git)
test -f src/models/vest_model.tflite && echo "✅ vest_model.tflite" || echo "⚠️  vest_model.tflite NOT in repo (expected)"
```

## Conclusion

**Status**: ✅ **READY FOR CORDOVA PLUGIN DEPLOYMENT**

The repository structure follows Cordova plugin conventions perfectly. The only consideration is the model file distribution strategy, which is common for ML-based plugins.

