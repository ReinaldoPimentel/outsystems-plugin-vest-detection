#import <Cordova/CDVPlugin.h>

@interface VestDetectionPlugin : CDVPlugin
- (void)warmup:(CDVInvokedUrlCommand*)command;
- (void)detectBase64:(CDVInvokedUrlCommand*)command;
@end



