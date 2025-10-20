package com.outsystems.vest;

import android.graphics.Bitmap;
import android.graphics.Matrix;

class ImageUtils {
    static Bitmap resize(Bitmap src, int width, int height) {
        return Bitmap.createScaledBitmap(src, width, height, true);
    }

    static Bitmap rotate(Bitmap src, float degrees) {
        Matrix matrix = new Matrix();
        matrix.postRotate(degrees);
        return Bitmap.createBitmap(src, 0, 0, src.getWidth(), src.getHeight(), matrix, true);
    }
}


