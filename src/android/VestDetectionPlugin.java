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
        if ("detectBase64".equals(action)) {
            if (args == null || args.length() == 0) {
                callbackContext.error("imageBase64 is required");
                return true;
            }
            final String b64 = args.optString(0, "");
            cordova.getThreadPool().execute(() -> {
                try {
                    ensureClassifier(callbackContext);
                    if (classifier == null) return; // error already reported

                    byte[] decoded = Base64.decode(b64, Base64.DEFAULT);
                    Bitmap bmp = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
                    if (bmp == null) {
                        callbackContext.error("Unable to decode image");
                        return;
                    }

                    TensorImage tensorImage = TensorImage.fromBitmap(bmp);
                    List<Classifications> result = classifier.classify(tensorImage);

                    // Aggregate top category across heads
                    String topLabel = "unknown";
                    float topScore = 0f;
                    for (Classifications classifications : result) {
                        if (classifications.getCategories().isEmpty()) continue;
                        var category = classifications.getCategories().get(0);
                        if (category.getScore() > topScore) {
                            topScore = category.getScore();
                            topLabel = category.getLabel();
                        }
                    }

                    JSONObject payload = new JSONObject();
                    payload.put("label", topLabel);
                    payload.put("confidence", (double) topScore);
                    // Convenience boolean if model label literally contains 'vest'
                    payload.put("vest", topLabel.toLowerCase().contains("vest"));
                    callbackContext.success(payload);
                } catch (Exception e) {
                    callbackContext.error(e.getMessage());
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


