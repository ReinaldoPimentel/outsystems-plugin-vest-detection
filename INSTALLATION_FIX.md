# Installation Error Fix

## Problem

The build failed with:
```
"source/plugins/outsystems-plugin-vest-detection/src/models/vest_model.tflite" not found!
```

## Root Cause

The `.gitignore` file was recently updated to exclude `.tflite` files. While this is a good practice for avoiding large binaries in git, it **broke the plugin installation** because OutSystems is trying to install the plugin directly from GitHub, and the model file is not being committed.

## Solution

The `.gitignore` entries for `.tflite` files have been removed. The model file **IS tracked in git** and **MUST stay tracked** for the plugin to work.

## Next Steps

1. **Commit the updated .gitignore** (removes the tflite exclusion)
2. **Ensure model file is committed** (it already is, but verify)
3. **Push to GitHub**
4. **Try build again**

## Why This Happened

When I added the `.tflite` exclusion to `.gitignore`, I was thinking about best practices for handling large binary files. However, since:
- The model file is already in git (8.9MB)
- Cornelius expects the plugin to have all files present
- OutSystems builds from GitHub directly

The exclusion actually broke the working plugin.

## Alternative Solutions (Future)

If you want to keep `.tflite` out of git in the future:
1. Use **Git LFS** to handle the large file
2. OR distribute the model file separately (download from releases)
3. OR increase Git file size limits for this repo

## Current Status

✅ `.gitignore` fixed - removed `.tflite` exclusion  
✅ Model file is tracked in git  
⏳ Ready to commit and push

