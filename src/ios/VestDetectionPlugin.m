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

- (void)detectBase64:(CDVInvokedUrlCommand*)command {
    if (command.arguments.count == 0) {
        CDVPluginResult* result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"imageBase64 is required"];
        [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
        return;
    }

    [self ensureClassifier:^(NSError* err){
        if (err) {
            CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:err.localizedDescription];
            [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
            return;
        }

        NSString* imageB64 = [command.arguments objectAtIndex:0];
        NSData* imageData = [[NSData alloc] initWithBase64EncodedString:imageB64 options:NSDataBase64DecodingIgnoreUnknownCharacters];
        UIImage* image = [UIImage imageWithData:imageData];
        if (!image) {
            CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Unable to decode image"];
            [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
            return;
        }

        TFLImage* tflImage = [[TFLImage alloc] initWithImage:image orientation:image.imageOrientation];
        NSError* classifyError = nil;
        TFLImageClassifierResult* result = [self.classifier classifyWithImage:tflImage error:&classifyError];
        if (classifyError) {
            CDVPluginResult* res = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:classifyError.localizedDescription];
            [self.commandDelegate sendPluginResult:res callbackId:command.callbackId];
            return;
        }

        NSString* topLabel = @"unknown";
        float topScore = 0.0f;
        for (TFLClassifications* head in result.classifications) {
            if (head.categories.count == 0) continue;
            TFLCategorizationCategory* cat = head.categories[0];
            if (cat.score > topScore) {
                topScore = cat.score;
                topLabel = cat.categoryName;
            }
        }

        NSDictionary* payload = @{ @"label": topLabel,
                                    @"confidence": @(topScore),
                                    @"vest": @([[topLabel lowercaseString] containsString:@"vest"]) };
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


