#import "BDEAppDelegate.h"

#import <React/RCTLinkingManager.h>

#import "BDEBundleURLProvider.h"
#import "DHDevHelper.h"
#import "Swizzle.h"
#import "BDEOpenURLQueue.h"

#import <React/RCTBridge.h>

@interface BDEAppDelegate ()

+ (void)swizzle:(NSString *)delegateClassName;

@end

static NSString *originalDelegateClassName;

extern int BDEApplicationMain(int argc, char * _Nullable argv[_Nonnull], NSString * _Nullable principalClassName, NSString * _Nullable delegateClassName)
{
#if DEBUG
    [BDEAppDelegate swizzle:delegateClassName];
    [[DHDevHelper sharedHelper] setupDevHelper];
#endif
    return UIApplicationMain(argc, argv, principalClassName, delegateClassName);
}

@implementation BDEAppDelegate

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
         ]) {
             [self swizzleDelegateMethod:NSSelectorFromString(selectorString)
                          forAppDelegate:appDelegateClass];
         }
     });
}

- (BOOL)swizzled_application:(UIApplication *)application
                     openURL:(NSURL *)url
                     options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    if ([url.host isEqualToString:@"bde"]) {
        if (BDEBundleURLProvider.sharedProvider.showsInternalPicker) {
            [BDEOpenURLQueue.sharedQueue add:url];
        } else {
            [BDEOpenURLQueue.sharedQueue add:url];
            [BDEBundleURLProvider.sharedProvider switchToInternalPicker];
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
        [[DHDevHelper sharedHelper] buildMenuWithBuilder:builder];
    }
}

- (UIResponder *)swizzled_nextResponder
{
    UIResponder *nextResponder = [self respondsToSelector:@selector(swizzled_nextResponder)] ?
                                                                [self swizzled_nextResponder] : nil;
    return  [[DHDevHelper sharedHelper] nextResponderInsteadOfResponder:nextResponder];
}

- (NSURL *)swizzled_sourceURLForBridge:(RCTBridge *)bridge
{
    return [BDEBundleURLProvider sharedProvider].entryURL;
}

@end
