# Vest Detection Model Testing

Test the `vest_model.tflite` TensorFlow Lite model locally without building the mobile app.

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Test a Single Image

```bash
# Example 1: Test a single image
python test_vest_model.py test_images/vest_example.jpg

# Example 2: Test a batch of images
python test_vest_model.py test_images/ --batch
```

## Usage

### Test Single Image
```bash
python test_vest_model.py <image_path>
```

### Test Multiple Images (Batch Mode)
```bash
python test_vest_model.py <images_directory> --batch
```

## Example Output

```
Loading model from: ../src/models/vest_model.tflite
Input shape: [1 224 224 3]
Input type: <class 'numpy.float32'>

Labels loaded: ['no_vest', 'vest']

Processing image: test_images/vest_example.jpg
Original size: 1920x1080
Preprocessed array shape: (224, 224, 3)

Running inference...

==================================================
RESULTS
==================================================
vest        : 0.9766 (97.66%) ████████████████████████████████
no_vest     : 0.0234 (2.34%)  █

🎯 Top prediction: vest
📊 Confidence: 0.9766 (97.66%)
✓ Vest detected: True
==================================================
```

## Folder Structure

```
test/
├── test_vestspect_model.py    # Main test script
├── requirements.txt            # Python dependencies
├── README.md                   # This file
└── test_images/               # (Optional) Add your test images here
    ├── vest_example.jpg
    ├── no_vest_example.jpg
    └── ...
```

## Requirements

- Python 3.7+
- TensorFlow >= 2.8.0
- Pillow >= 9.0.0
- NumPy >= 1.21.0

## Notes

- The model expects RGB images that will be resized to 224x224
- Images are normalized using: `(pixel - 127.5) / 127.5`
- This matches exactly how the Android and iOS plugins process images
- Model must be located at `../src/models/vest_model.tflite` (relative to this folder)

## Troubleshooting

**Error: Model not found**
- Make sure you're running the script from the `test/` directory
- Verify `../src/models/vest_model.tflite` exists

**Error: No module named 'tensorflow'**
- Install dependencies: `pip install -r requirements.txt`

**Error: Image not found**
- Check the image path is correct
- Supported formats: JPG, JPEG, PNG, BMP, WEBP

