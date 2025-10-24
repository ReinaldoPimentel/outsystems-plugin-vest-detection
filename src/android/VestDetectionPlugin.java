package com.outsystems.vest;

import android.content.res.AssetFileDescriptor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.FileInputStream;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.List;
import java.util.ArrayList;

import org.tensorflow.lite.support.image.ImageProcessor;
import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.support.label.Category;
import org.tensorflow.lite.Interpreter;
import org.tensorflow.lite.support.common.FileUtil;
import org.tensorflow.lite.support.common.ops.NormalizeOp;
import org.tensorflow.lite.support.image.ops.ResizeOp;
import org.tensorflow.lite.support.image.ops.ResizeWithCropOrPadOp;
import org.tensorflow.lite.support.image.ops.Rot90Op;
// Using TensorFlow Lite Support Library API

public class VestDetectionPlugin extends CordovaPlugin {
    private volatile Interpreter interpreter;
    private volatile ImageProcessor imageProcessor;
    private List<String> labels;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if ("warmup".equals(action)) {
            cordova.getThreadPool().execute(() -> {
                try {
                    loadModel();
                    callbackContext.success("Model loaded successfully");
                } catch (Exception e) {
                    callbackContext.error("Warmup failed: " + e.getMessage());
                }
            });
            return true;
        }
        if ("test".equals(action)) {
            JSONObject testResult = new JSONObject();
            try {
                testResult.put("message", "Plugin is working");
                testResult.put("timestamp", System.currentTimeMillis());
                testResult.put("platform", "Android");
                callbackContext.success(testResult);
            } catch (Exception e) {
                callbackContext.error("Test failed: " + e.getMessage());
            }
            return true;
        }
        if ("detectBase64".equals(action)) {
            if (args == null || args.length() == 0) {
                callbackContext.error("imageBase64 is required");
                return true;
            }
            final String b64 = args.optString(0, "");
            cordova.getThreadPool().execute(() -> {
                StringBuilder debugLog = new StringBuilder();
                try {
                    debugLog.append("Step 1: Starting detection\n");
                    debugLog.append("DEBUG: Thread started, base64 length: ").append(b64.length()).append("\n");
                    
                    if (interpreter == null) {
                        loadModel();
                    }
                    debugLog.append("Step 2: SUCCESS - Model loaded\n");

                    byte[] decoded = Base64.decode(b64, Base64.DEFAULT);
                    debugLog.append("Step 3: Base64 decoded, length: ").append(decoded.length).append(" bytes\n");
                    
                    Bitmap bmp = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
                    if (bmp == null) {
                        debugLog.append("Step 4: FAILED - Unable to decode image\n");
                        try {
                            JSONObject errorPayload = new JSONObject();
                            errorPayload.put("error", "Unable to decode image");
                            errorPayload.put("debugLog", debugLog.toString());
                            callbackContext.error(errorPayload);
                        } catch (Exception jsonException) {
                            callbackContext.error("Unable to decode image");
                        }
                        return;
                    }
                    debugLog.append("Step 4: SUCCESS - Image decoded, size: ").append(bmp.getWidth()).append("x").append(bmp.getHeight()).append("\n");

                    // Process image using Support Library
                    TensorImage tensorImage = new TensorImage();
                    tensorImage.load(bmp);
                    TensorImage processedImage = imageProcessor.process(tensorImage);
                    debugLog.append("Step 5: SUCCESS - Image processed\n");

                    // Run inference
                    float[][] output = new float[1][labels.size()];
                    interpreter.run(processedImage.getBuffer(), output);
                    debugLog.append("Step 6: SUCCESS - Inference completed\n");

                    // Process results
                    List<Category> categories = new ArrayList<>();
                    for (int i = 0; i < labels.size(); i++) {
                        categories.add(new Category(labels.get(i), output[0][i]));
                    }
                    
                    // Sort by confidence score
                    categories.sort((a, b) -> Float.compare(b.getScore(), a.getScore()));
                    
                    debugLog.append("Step 7: SUCCESS - Results processed\n");
                    debugLog.append("Top result: ").append(categories.get(0).getLabel())
                           .append(" (score: ").append(categories.get(0).getScore()).append(")\n");

                    String topLabel = categories.get(0).getLabel();
                    float topScore = categories.get(0).getScore();
                    boolean vestDetected = topLabel.toLowerCase().contains("vest");
                    debugLog.append("Step 8: Final result - Label: '").append(topLabel).append("', Score: ").append(topScore)
                           .append(", Contains 'vest': ").append(vestDetected).append("\n");

                    debugLog.append("Step 9: Creating response payload\n");
                    
                    JSONObject payload = new JSONObject();
                    payload.put("label", topLabel);
                    payload.put("confidence", (double) topScore);
                    payload.put("vest", vestDetected);
                    payload.put("debugLog", debugLog.toString());
                    payload.put("allClassifications", result.size());
                    payload.put("testField", "Android callback working");
                    
                    debugLog.append("Step 10: Sending success response\n");
                    callbackContext.success(payload);
                } catch (Exception e) {
                    debugLog.append("EXCEPTION: ").append(e.getMessage()).append("\n");
                    try {
                        JSONObject errorPayload = new JSONObject();
                        errorPayload.put("error", "Detection failed: " + e.getMessage());
                        errorPayload.put("debugLog", debugLog.toString());
                        callbackContext.error(errorPayload);
                    } catch (Exception jsonException) {
                        callbackContext.error("Detection failed: " + e.getMessage());
                    }
                }
            });
            return true;
        }
        return false;
    }

    private synchronized void loadModel() throws Exception {
        if (interpreter != null) return;
        
        // Load model
        MappedByteBuffer modelBuffer = loadModelFile("vest_model.tflite");
        Interpreter.Options options = new Interpreter.Options();
        interpreter = new Interpreter(modelBuffer, options);
        
        // Load labels (assuming labels.txt exists in assets)
        labels = FileUtil.loadLabels(cordova.getContext(), "labels.txt");
        
        // Create image processor
        imageProcessor = new ImageProcessor.Builder()
                .add(new ResizeWithCropOrPadOp(224, 224))
                .add(new NormalizeOp(127.5f, 127.5f))
                .build();
    }
    
    private MappedByteBuffer loadModelFile(String modelPath) throws Exception {
        AssetFileDescriptor fileDescriptor = cordova.getContext().getAssets().openFd(modelPath);
        FileInputStream inputStream = new FileInputStream(fileDescriptor.getFileDescriptor());
        FileChannel fileChannel = inputStream.getChannel();
        long startOffset = fileDescriptor.getStartOffset();
        long declaredLength = fileDescriptor.getDeclaredLength();
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength);
    }
}


