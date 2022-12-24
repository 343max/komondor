#import "KDRAppDelegate.h"

#import <React/RCTLinkingManager.h>

#import "KDRBundleURLProvider.h"
#import "KDRDevHelper.h"
#import "Swizzle.h"
#import "KDROpenURLQueue.h"
#import "Komondor.h"
#import "RCTSRWebSocket+Komondor.h"

#import <React/RCTBridge.h>

extern int KDRApplicationMain(int argc, char * _Nullable argv[_Nonnull], NSString * _Nullable principalClassName, NSString * _Nullable delegateClassName)
{
#if KOMONDOR_ENABLED
    [KDRAppDelegate swizzle:delegateClassName];
    [RCTSRWebSocket swizzle];
    
    [[KDRDevHelper sharedHelper] setupDevHelper];
#endif
    return UIApplicationMain(argc, argv, principalClassName, delegateClassName);
}

#if KOMONDOR_ENABLED

@implementation KDRAppDelegate

#if KOMONDOR_ENABLED
+ (void)load
{
    [KDRAppDelegate swizzle:@"AppDelegate"];
    [RCTSRWebSocket swizzle];
    
    [[KDRDevHelper sharedHelper] setupDevHelper];
}
#endif

+ (void)swizzleDelegateMethod:(SEL)originalSelector forAppDelegate:(Class)appDelegateClass;
{
    NSString *swizzledSelectorName = [NSString stringWithFormat:@"swizzled_%@", NSStringFromSelector(originalSelector)];
    SEL swizzledSelector = NSSelectorFromString(swizzledSelectorName);
    
    NSAssert([self instancesRespondToSelector:swizzledSelector], @"%@ not implemented and can't be swizzled", swizzledSelectorName);
    
    swizzleMethod(appDelegateClass, originalSelector, self, swizzledSelector);
}

+ (void)swizzle:(NSString *)delegateClassName
{
    Class appDelegateClass = NSClassFromString(delegateClassName);
    NSAssert(appDelegateClass != nil, @"No App Delegate!");
    static dispatch_once_t token;
    dispatch_once(&token, ^{
        for(NSString *selectorString in @[
            @"application:openURL:options:",
            @"buildMenuWithBuilder:",
            @"nextResponder",
            @"sourceURLForBridge:",
            @"extraModulesForBridge:",
            @"application:didFinishLaunchingWithOptions:"
        ]) {
            [self swizzleDelegateMethod:NSSelectorFromString(selectorString)
                         forAppDelegate:appDelegateClass];
        }
    });
}

- (BOOL)swizzled_application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    BOOL result = [self swizzled_application:application didFinishLaunchingWithOptions:launchOptions];
    
    application.idleTimerDisabled = YES;
    
    [[UIApplication sharedApplication].connectedScenes enumerateObjectsUsingBlock:^(UIScene * _Nonnull scene, BOOL * _Nonnull stop) {
        if ([scene isKindOfClass:[UIWindowScene class]]) {
            ((UIWindowScene *)scene).sizeRestrictions.minimumSize = CGSizeMake(284, 512);
        }
    }];
    
    return result;
}


- (BOOL)swizzled_application:(UIApplication *)application
                     openURL:(NSURL *)url
                     options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    if ([url.host isEqualToString:@"kdr"]) {
        if (KDRBundleURLProvider.sharedProvider.showsInternalPicker) {
            [KDROpenURLQueue.sharedQueue add:url];
        } else {
            [KDROpenURLQueue.sharedQueue add:url];
            [KDRBundleURLProvider.sharedProvider switchToInternalPicker];
        }
        return YES;
    } else if ([self respondsToSelector:@selector(swizzled_application:openURL:options:)]) {
        return [self swizzled_application:application openURL:url options:options];
    } else {
        return NO;
    }
}

- (void)swizzled_buildMenuWithBuilder:(id<UIMenuBuilder>)builder API_AVAILABLE(ios(13.0))
{
    if ([self respondsToSelector:@selector(swizzled_buildMenuWithBuilder:)]) {
        [self swizzled_buildMenuWithBuilder:builder];
    }
    
    if (builder.system == [UIMenuSystem mainSystem]) {
        [[KDRDevHelper sharedHelper] buildMenuWithBuilder:builder];
    }
}

- (UIResponder *)swizzled_nextResponder
{
    UIResponder *nextResponder = [self respondsToSelector:@selector(swizzled_nextResponder)] ?
    [self swizzled_nextResponder] : nil;
    return  [[KDRDevHelper sharedHelper] nextResponderInsteadOfResponder:nextResponder];
}

- (NSURL *)swizzled_sourceURLForBridge:(RCTBridge *)bridge
{
    return [KDRBundleURLProvider sharedProvider].entryURL;
}

- (NSArray<id<RCTBridgeModule>> *)swizzled_extraModulesForBridge:(RCTBridge *)bridge
{
    return @[
        [[Komondor alloc] init]
    ];
}

@end

#endif
