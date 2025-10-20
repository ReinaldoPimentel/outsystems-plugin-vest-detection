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

import org.tensorflow.lite.support.image.TensorImage;
import org.tensorflow.lite.task.vision.classifier.Classifications;
import org.tensorflow.lite.task.vision.classifier.ImageClassifier;
// Removed ImageClassifierResult import; classify now returns List<Classifications>

public class VestDetectionPlugin extends CordovaPlugin {
    private volatile ImageClassifier classifier;

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        if ("warmup".equals(action)) {
            cordova.getThreadPool().execute(() -> {
                ensureClassifier(callbackContext);
                if (classifier != null) {
                    callbackContext.success();
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
                    
                    ensureClassifier(callbackContext);
                    if (classifier == null) {
                        debugLog.append("Step 2: FAILED - Classifier is null\n");
                        try {
                            JSONObject errorPayload = new JSONObject();
                            errorPayload.put("error", "Failed to load TensorFlow Lite model");
                            errorPayload.put("debugLog", debugLog.toString());
                            callbackContext.error(errorPayload);
                        } catch (Exception jsonException) {
                            callbackContext.error("Failed to load TensorFlow Lite model");
                        }
                        return;
                    }
                    debugLog.append("Step 2: SUCCESS - Classifier loaded\n");

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

                    TensorImage tensorImage = TensorImage.fromBitmap(bmp);
                    debugLog.append("Step 5: SUCCESS - TensorImage created\n");
                    
                    List<Classifications> result = classifier.classify(tensorImage);
                    debugLog.append("Step 6: SUCCESS - Classification completed, got ").append(result.size()).append(" classification heads\n");

                    // Aggregate top category across heads
                    String topLabel = "unknown";
                    float topScore = 0f;
                    debugLog.append("Step 7: Processing classification results:\n");
                    
                    for (int i = 0; i < result.size(); i++) {
                        Classifications classifications = result.get(i);
                        debugLog.append("  Head ").append(i).append(": ").append(classifications.getCategories().size()).append(" categories\n");
                        
                        if (classifications.getCategories().isEmpty()) continue;
                        
                        for (int j = 0; j < Math.min(classifications.getCategories().size(), 3); j++) {
                            var category = classifications.getCategories().get(j);
                            debugLog.append("    Category ").append(j).append(": ").append(category.getLabel())
                                   .append(" (score: ").append(category.getScore()).append(")\n");
                        }
                        
                        var category = classifications.getCategories().get(0);
                        if (category.getScore() > topScore) {
                            topScore = category.getScore();
                            topLabel = category.getLabel();
                            debugLog.append("  NEW TOP: ").append(topLabel).append(" (score: ").append(topScore).append(")\n");
                        }
                    }

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

    private synchronized void ensureClassifier(CallbackContext callbackContext) {
        if (classifier != null) return;
        try {
            ImageClassifier.ImageClassifierOptions options = ImageClassifier.ImageClassifierOptions.builder()
                    .setMaxResults(3)
                    .build();
            classifier = ImageClassifier.createFromFileAndOptions(
                    cordova.getContext(),
                    "vest_model.tflite",
                    options
            );
        } catch (Exception e) {
            callbackContext.error("Failed to load model: " + e.getMessage());
        }
    }
}


