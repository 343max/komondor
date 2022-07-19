#import "BetterDevExp.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTReloadCommand.h>
#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNBetterDevExpSpec.h"
#endif

#if __has_include(<React/RCTDevMenu.h>)
#import <React/RCTDevMenu.h>
#endif

#import "BDEBundleURLProvider.h"
#import "DHDevHelper.h"

static BOOL hasSwitched = NO;

@interface BetterDevExp ()

#if __has_include(<React/RCTDevMenu.h>)
@property (strong, nonatomic) RCTDevMenuItem *resetBundleEndpoint;
#endif

@end

@implementation BetterDevExp

RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(switchToPackager, switchToPackagerHost:(NSString *__nonnull)host
                                                   port:(NSNumber *__nonnull)port
                                                 scheme:(NSString *__nonnull)scheme
                                           withResolver:(RCTPromiseResolveBlock)resolve
                                           withRejecter:(RCTPromiseRejectBlock)reject)
{
    hasSwitched = YES;
    
    [[BDEBundleURLProvider sharedProvider] switchToPackagerHost:host
                                                           port:port.unsignedIntegerValue
                                                         scheme:scheme];
    resolve(nil);
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
                                                       port:(NSNumber *__nonnull)port
                                                     scheme:(NSString *)scheme
                                               withResolver:(RCTPromiseResolveBlock)resolve
                                               withRejecter:(RCTPromiseRejectBlock)reject) {
    BOOL running = [RCTBundleURLProvider isPackagerRunning:[NSString stringWithFormat:@"%@:%li", host, port.integerValue]
                                                    scheme:scheme];
    resolve([NSNumber numberWithBool:running]);
}

RCT_REMAP_METHOD(hasNotSwitched, hasNotSwitchedWithResolver:(RCTPromiseResolveBlock)resolve
                                               withRejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([NSNumber numberWithBool:!hasSwitched]);
}

RCT_REMAP_METHOD(isRunningOnDesktop, isRunningOnDesktopWithResolver:(RCTPromiseResolveBlock)resolve
                                                       withRejecter:(RCTPromiseRejectBlock)reject)
{
    resolve([NSNumber numberWithBool:[DHDevHelper isRunningOnMac]]);
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBetterDevExpSpecJSI>(params);
}
#endif

@end
