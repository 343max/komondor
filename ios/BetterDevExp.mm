#import "BetterDevExp.h"

#import <React/RCTBundleURLProvider.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNBetterDevExpSpec.h"
#endif

@implementation BetterDevExp
RCT_EXPORT_MODULE()

// Example method
// See // https://reactnative.dev/docs/native-modules-ios
RCT_REMAP_METHOD(multiply,
                 multiplyWithA:(double)a withB:(double)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
  NSNumber *result = @(a * b);

  resolve(result);
}

RCT_REMAP_METHOD(getUrlSchemes,
                 getUrlSchemesWithResolver:(RCTPromiseResolveBlock)resolve
                              withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSDictionary* dict = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleURLTypes"] firstObject];
    
    if (dict == nil) {
        resolve(@[]);
        return;
    }
    
    NSArray *schemes = dict[@"CFBundleURLSchemes"];
    
    if (![schemes isKindOfClass:[NSArray class]]) {
        resolve(@[]);
        return;
    }
    
    resolve(schemes);
}

RCT_REMAP_METHOD(isPackagerRunning, isPackagerRunningOnHost:(NSString *)host
                                                     scheme:(NSString *)scheme
                                               withResolver:(RCTPromiseResolveBlock)resolve
                                               withRejecter:(RCTPromiseRejectBlock)reject) {
    BOOL running = [RCTBundleURLProvider isPackagerRunning:host scheme:scheme];
    resolve([NSNumber numberWithBool:running]);
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBetterDevExpSpecJSI>(params);
}
#endif

@end
