#!/usr/bin/env python3
"""
Local test script for vest_model.tflite
Tests the TensorFlow Lite model with local images
"""

import tensorflow as tf
import numpy as np
from PIL import Image
import sys
import os

def test_vest_model(model_path, image_path):
    """Test the vest detection model locally"""
    
    # Load model
    print(f"Loading model from: {model_path}")
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    
    # Get tensor details
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    
    print(f"Input shape: {input_details[0]['shape']}")
    print(f"Input type: {input_details[0]['dtype']}")
    print(f"Output shape: {output_details[0]['shape']}")
    print()
    
    # Load labels
    labels_path = os.path.join(os.path.dirname(model_path), 'labels.txt')
    try:
        with open(labels_path, 'r') as f:
            labels = [line.strip() for line in f.readlines()]
    except FileNotFoundError:
        print(f"Warning: labels.txt not found at {labels_path}, using defaults")
        labels = ['no_vest', 'vest']
    
    print(f"Labels loaded: {labels}")
    print()
    
    # Load and preprocess image
    print(f"Processing image: {image_path}")
    img = Image.open(image_path).convert('RGB')
    original_size = img.size
    print(f"Original size: {original_size[0]}x{original_size[1]}")
    
    # Resize to 224x224 (same as Android/iOS)
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    
    # Normalize: (pixel - 127.5) / 127.5 (same as Android)
    img_array = (img_array - 127.5) / 127.5
    
    print(f"Preprocessed array shape: {img_array.shape}")
    print(f"Preprocessed array range: [{img_array.min():.2f}, {img_array.max():.2f}]")
    print()
    
    # Add batch dimension [1, 224, 224, 3]
    input_data = np.expand_dims(img_array, axis=0)
    
    # Run inference
    print("Running inference...")
    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()
    
    # Get results
    output_data = interpreter.get_tensor(output_details[0]['index'])
    probabilities = output_data[0]
    
    
    # Display results
    print("\n" + "="*50)
    print("RESULTS")
    print("="*50)
    
    # Handle different output shapes
    # If output is [1] or single value, it's binary (0=no_vest, 1=vest or sigmoid output)
    if probabilities.shape == () or probabilities.shape == (1,):
        # Binary classification - interpret output
        binary_output = float(probabilities) if probabilities.shape == () else float(probabilities[0])
        
        # Interpret: value likely represents "vest" probability
        # Threshold at 0.5 for binary classification
        if binary_output >= 0.5:
            vest_prob = binary_output
            no_vest_prob = 1.0 - binary_output
            max_idx = 1
        else:
            vest_prob = binary_output
            no_vest_prob = 1.0 - binary_output
            max_idx = 0
        
        results = [
            ('no_vest', no_vest_prob),
            ('vest', vest_prob)
        ]
    else:
        # Multi-class output (standard case)
        results = sorted(zip(labels, probabilities), key=lambda x: x[1], reverse=True)
        max_idx = np.argmax(probabilities)
    
    # Display results
    for label, score in results:
        bar = '#' * int(score * 30)  # Visual bar (use # instead of emoji for Windows compatibility)
        print(f"{label:12}: {score:6.4f} ({score*100:5.2f}%) {bar}")
    
    vest_detected = labels[max_idx] == 'vest'
    
    # Build dict for easy lookup
    scores_dict = {label: score for label, score in results}
    top_confidence = scores_dict[labels[max_idx]]
    
    print()
    print(f">> Top prediction: {labels[max_idx]}")
    print(f">> Confidence: {top_confidence:.4f} ({top_confidence*100:.2f}%)")
    print(f">> Vest detected: {vest_detected}")
    print("="*50)
    
    # Build all_scores dict (convert to float)
    all_scores = {label: float(score) for label, score in scores_dict.items()}
    
    return {
        'label': labels[max_idx],
        'confidence': float(top_confidence),
        'vest': vest_detected,
        'all_scores': all_scores
    }

def batch_test(model_path, images_dir):
    """Test multiple images in a directory"""
    if not os.path.isdir(images_dir):
        print(f"Error: {images_dir} is not a directory")
        return
    
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.webp']
    image_files = [
        f for f in os.listdir(images_dir)
        if any(f.lower().endswith(ext) for ext in image_extensions)
    ]
    
    if not image_files:
        print(f"No images found in {images_dir}")
        return
    
    print(f"Found {len(image_files)} images to test\n")
    
    for i, image_file in enumerate(image_files, 1):
        image_path = os.path.join(images_dir, image_file)
        print(f"\n{'='*60}")
        print(f"Image {i}/{len(image_files)}: {image_file}")
        print('='*60)
        try:
            test_vest_model(model_path, image_path)
        except Exception as e:
            print(f"Error processing {image_file}: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python test_vest_model.py <image_path>")
        print("  python test_vest_model.py <images_directory> --batch")
        print()
        print("Example:")
        print("  python test_vest_model.py ../src/models/vest_model.tflite test_images/test1.jpg")
        print("  python test_vest_model.py ../src/models/vest_model.tflite test_images/ --batch")
        sys.exit(1)
    
    # Default model path (relative to test folder)
    model_path = '../src/models/vest_model.tflite'
    
    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}")
        print("Make sure you run this script from the test/ directory")
        sys.exit(1)
    
    input_path = sys.argv[1]
    
    # Check if batch mode
    if '--batch' in sys.argv or os.path.isdir(input_path):
        batch_test(model_path, input_path)
    else:
        if not os.path.exists(input_path):
            print(f"Error: Image not found at {input_path}")
            sys.exit(1)
        test_vest_model(model_path, input_path)

if __name__ == "__main__":
    main()

