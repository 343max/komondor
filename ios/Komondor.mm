#import "Komondor.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTReloadCommand.h>
#import <React/RCTUtils.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNKomondorSpec.h"
#endif

#if __has_include(<React/RCTDevMenu.h>)
#import <React/RCTDevMenu.h>
#endif

#if KOMONDOR_ENABLED
#import "KDRAppDelegate.h"
#import "KDRBundleURLProvider.h"
#import "KDRDevHelper.h"
#import "KDROpenURLQueue.h"
#import "array_map.h"
#endif

static BOOL hasSwitched = NO;

@interface Komondor ()

#if __has_include(<React/RCTDevMenu.h>)
@property (strong, nonatomic) RCTDevMenuItem *resetBundleEndpoint;
#endif

@end

@implementation Komondor

@synthesize bridge = _bridge;

- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
#if KOMONDOR_ENABLED
    [[KDRDevHelper sharedHelper] setupDevMenuWithBridge:bridge];
#endif
}

RCT_EXPORT_MODULE()

RCT_REMAP_METHOD(switchToPackager, switchToPackagerHost:(NSString *__nonnull)host
                                                   port:(NSNumber *__nonnull)port
                                                 scheme:(NSString *__nonnull)scheme
                                           withResolver:(RCTPromiseResolveBlock)resolve
                                           withRejecter:(RCTPromiseRejectBlock)reject)
{
    hasSwitched = YES;

#if KOMONDOR_ENABLED
  [[KDRBundleURLProvider sharedProvider] switchToPackagerHost:host
                                                           port:port.unsignedIntegerValue
                                                         scheme:scheme];
#endif
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
#if KOMONDOR_ENABLED
    resolve([NSNumber numberWithBool:[KDRDevHelper isRunningOnMac]]);
#else
    resolve(@NO);
#endif
}

RCT_REMAP_METHOD(storeDefaults, storeDefaultsKey:(NSString *)key
                                           value:(NSString *)value
                                    withResolver:(RCTPromiseResolveBlock)resolve
                                    withRejecter:(RCTPromiseRejectBlock)reject)
{
    [[NSUserDefaults standardUserDefaults] setObject:value forKey:[NSString stringWithFormat:@"KDR_%@", key]];
    resolve(nil);
}

RCT_REMAP_METHOD(loadDefaults, loadDefaultsKey:(NSString *)key
                                  withResolver:(RCTPromiseResolveBlock)resolve
                                  withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSString *value = [[NSUserDefaults standardUserDefaults] objectForKey:[NSString stringWithFormat:@"KDR_%@", key]];
    if ([value isKindOfClass:[NSString class]]) {
        resolve(value);
    } else {
        resolve(nil);
    }
}

RCT_REMAP_METHOD(supportsLocalDevelopment, supportsLocalDevelopmentWithResolver:(RCTPromiseResolveBlock)resolve
                                                                   withRejecter:(RCTPromiseRejectBlock)reject)
{
#if KOMONDOR_ENABLED
#if TARGET_OS_SIMULATOR
    resolve([NSNumber numberWithBool:YES]);
#else
    resolve([NSNumber numberWithBool:[KDRDevHelper isRunningOnMac]]);
#endif
#else
  resolve(@NO);
#endif
}

RCT_REMAP_METHOD(getOpenURLQueue, getOpenURLQueueWithResolver:(RCTPromiseResolveBlock)resolve
                                                 withRejecter:(RCTPromiseRejectBlock)reject)
{
#if KOMONDOR_ENABLED
    NSArray *queue = KDROpenURLQueue.sharedQueue.stringQueue;
    [KDROpenURLQueue.sharedQueue flush];
    resolve(queue);
#else
    resolve(@[]);
#endif
}

- (void)startObserving
{
#if KOMONDOR_ENABLED
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleEventListener:)
                                                 name:KDROpenURLQueueChangeNotification
                                               object:nil];
#endif
}

- (void)stopObserving
{
#if KOMONDOR_ENABLED
    [[NSNotificationCenter defaultCenter] removeObserver:self
                                                    name:KDROpenURLQueueChangeNotification
                                                  object:nil];
#endif
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
        @"queueAdded",
        @"bonjourBrowserWillSearch",
        @"bonjourBrowserDidStopSearch",
        @"bonjourBrowserDidNotSearch",
        @"bonjourBrowserDidFindService",
        @"bonjourBrowserDidRemoveService",
        @"bonjourBrowserDidResolveAddress",
        @"bonjourBrowserDidNotResolve"
    ];
}

- (void)handleEventListener:(NSNotification *)notification
{
#if KOMONDOR_ENABLED
    [KDROpenURLQueue.sharedQueue flush];
    [self sendEventWithName:notification.userInfo[@"type"]
                       body:notification.userInfo[@"body"]];
#endif
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeKomondorSpecJSI>(params);
}
#endif

@end
