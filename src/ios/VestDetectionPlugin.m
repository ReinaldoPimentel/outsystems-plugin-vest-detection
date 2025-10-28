#import "VestDetectionPlugin.h"
#import <UIKit/UIKit.h>
#import <TensorFlowLiteTaskVision/TFLImageClassifier.h>

@interface VestDetectionPlugin()
@property(nonatomic, strong) TFLImageClassifier* classifier;
@end

@implementation VestDetectionPlugin

- (void)warmup:(CDVInvokedUrlCommand*)command {
    [self ensureClassifier:^(NSError* err){
        CDVPluginResult* result = err ? [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:err.localizedDescription] : [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }];
}

- (void)test:(CDVInvokedUrlCommand*)command {
    NSDictionary* testResult = @{ @"message": @"Plugin is working",
                                   @"timestamp": @([[NSDate date] timeIntervalSince1970]),
                                   @"platform": @"iOS" };
    CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:testResult];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)detectBase64:(CDVInvokedUrlCommand*)command {
    if (command.arguments.count == 0) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"imageBase64 is required"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    [self ensureClassifier:^(NSError* err){
        if (err) {
            NSDictionary* errorPayload = @{ @"error": err.localizedDescription,
                                           @"debugLog": @"Step 1: FAILED - Classifier loading failed" };
            CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorPayload];
            [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
            return;
        }

        NSMutableString* debugLog = [[NSMutableString alloc] init];
        [debugLog appendString:@"Step 1: SUCCESS - Classifier loaded\n"];

        NSString* imageB64 = [command.arguments objectAtIndex:0];
        NSData* imageData = [[NSData alloc] initWithBase64EncodedString:imageB64 options:NSDataBase64DecodingIgnoreUnknownCharacters];
        [debugLog appendFormat:@"Step 2: Base64 decoded, length: %lu bytes\n", (unsigned long)imageData.length];
        
        UIImage* image = [UIImage imageWithData:imageData];
        if (!image) {
            [debugLog appendString:@"Step 3: FAILED - Unable to decode image\n"];
            NSDictionary* errorPayload = @{ @"error": @"Unable to decode image",
                                          @"debugLog": debugLog };
            CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorPayload];
            [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
            return;
        }
        [debugLog appendFormat:@"Step 3: SUCCESS - Image decoded, size: %.0fx%.0f\n", image.size.width, image.size.height];

        TFLImage* tflImage = [[TFLImage alloc] initWithImage:image orientation:image.imageOrientation];
        [debugLog appendString:@"Step 4: SUCCESS - TFLImage created\n"];
        
        NSError* classifyError = nil;
        TFLImageClassifierResult* result = [self.classifier classifyWithImage:tflImage error:&classifyError];
        if (classifyError) {
            [debugLog appendFormat:@"Step 5: FAILED - Classification error: %@\n", classifyError.localizedDescription];
            NSDictionary* errorPayload = @{ @"error": classifyError.localizedDescription,
                                          @"debugLog": debugLog };
            CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorPayload];
            [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
            return;
        }
        [debugLog appendFormat:@"Step 5: SUCCESS - Classification completed, got %lu classification heads\n", (unsigned long)result.classifications.count];

        NSString* topLabel = @"unknown";
        float topScore = 0.0f;
        [debugLog appendString:@"Step 6: Processing classification results:\n"];
        
        for (NSUInteger i = 0; i < result.classifications.count; i++) {
            TFLClassifications* head = result.classifications[i];
            [debugLog appendFormat:@"  Head %lu: %lu categories\n", (unsigned long)i, (unsigned long)head.categories.count];
            
            if (head.categories.count == 0) continue;
            
            for (NSUInteger j = 0; j < MIN(head.categories.count, 3); j++) {
                TFLCategorizationCategory* cat = head.categories[j];
                [debugLog appendFormat:@"    Category %lu: %@ (score: %.3f)\n", (unsigned long)j, cat.categoryName, cat.score];
            }
            
            TFLCategorizationCategory* cat = head.categories[0];
            if (cat.score > topScore) {
                topScore = cat.score;
                topLabel = cat.categoryName;
                [debugLog appendFormat:@"  NEW TOP: %@ (score: %.3f)\n", topLabel, topScore];
            }
        }

        BOOL vestDetected = [[topLabel lowercaseString] containsString:@"vest"];
        [debugLog appendFormat:@"Step 7: Final result - Label: '%@', Score: %.3f, Contains 'vest': %@\n", topLabel, topScore, vestDetected ? @"YES" : @"NO"];

        NSDictionary* payload = @{ @"label": topLabel,
                                  @"confidence": @(topScore),
                                  @"vest": @(vestDetected),
                                  @"debugLog": debugLog,
                                  @"allClassifications": @(result.classifications.count) };
        CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:payload];
        [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
    }];
}

- (void)ensureClassifier:(void (^)(NSError* err))completion {
    if (self.classifier) { completion(nil); return; }
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        NSError* error = nil;
        TFLImageClassifierOptions* options = [[TFLImageClassifierOptions alloc] init];
        options.maxResults = 3;
        NSString* modelPath = [[NSBundle mainBundle] pathForResource:@"vest_model" ofType:@"tflite"];
        self.classifier = [TFLImageClassifier imageClassifierWithModelPath:modelPath options:options error:&error];
        dispatch_async(dispatch_get_main_queue(), ^{ completion(error); });
    });
}

@end


