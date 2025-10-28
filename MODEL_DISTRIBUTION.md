# Model File Distribution Strategy

## Current Situation

✅ **Model file IS tracked in git** (8.9MB `vest_model.tflite`)  
✅ **Was committed on**: Oct 20, 2025  
⚠️ **Recent .gitignore change** now ignores `.tflite` files

## Decision Required

Since `.gitignore` was updated to exclude `*.tflite` files, you need to decide how to handle the model:

### Option 1: Remove from Git (Recommended for Clean Repo)
```bash
# Remove from git tracking but keep locally
git rm --cached src/models/vest_model.tflite

# Commit the removal
git commit -m "chore: Use Git LFS for model file"

# Add to Git LFS
git lfs install
git lfs track "*.tflite"
git add .gitattributes
git add src/models/vest_model.t判断

# Commit
git commit -m "feat: Add model file via Git LFS"

# Push
git push origin main
```

**Pros:**
- Clean repository history
- Better for large binary files
- Follows best practices

**Cons:**
- Users need to install Git LFS
- Or download from releases

### Option 2: Keep Model in Git (Simpler for Users)
```bash
# Remove the .tflite exclusion from .gitignore
# Since model is already committed, it will remain tracked
```

**Pros:**
- Simplest for users (just clone and use)
- No extra steps

**Cons:**
- Large binary in git history
- Slower clone times

### Option 3: Remove from Git, Distribute via Releases
```bash
# Remove from tracking
git rm --cached src/models/vest_model.tflite
git commit -m "chore: Remove model from git (distribute via releases)"

# Update README with download instructions
```

Then create a GitHub Release and upload the model as an asset.

---

## Recommendation: **Option 1 (Git LFS)**

Git LFS is designed for large binary files like ML models. It stores the actual file content on a separate server and only downloads it when needed.

### Setup Instructions

1. **Install Git LFS**:
   ```bash
   # Windows: Download from https://git-lfs.github.com/
   # Or use: winget install git-lfs
   git lfs install
   ```

2. **Track .tflite files**:
   ```bash
   git lfs track "*.tflite"
   git add .gitattributes
   ```

3. **Add the model**:
   ```bash
   git add src/models/vest_model.tflite
   git commit -m "Add model via Git LFS"
   ```

4. **Push**:
   ```bash
   git push origin main
   ```

5. **For users**:
   - If they have Git LFS: `git clone` works normally
   - If they don't: They'll get pointer files (need to download manually)

---

## For OutSystems Integration

Currently, the model **IS in git** so the plugin will work as-is. However, consider the long-term strategy for the ~9MB binary file.

**Current state**: ✅ Ready to use  
**Future**: Decide on distribution strategy

