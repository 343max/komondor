#import "BDEAppDelegateSwizzle.h"

#import <React/RCTLinkingManager.h>

#import "BDEBundleURLProvider.h"
#import "DHDevHelper.h"
#import "Swizzle.h"

#import <React/RCTBridge.h>

@implementation BDEAppDelegateSwizzle

+ (void)swizzle
{
    static dispatch_once_t token;
    dispatch_once(&token, ^{
        Class appDelegateClass = [[UIApplication sharedApplication].delegate class];
        NSAssert(appDelegateClass != nil, @"No App Delegate!");
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

+ (void)swizzleDelegateMethod:(SEL)originalSelector forAppDelegate:(Class)appDelegateClass;
{
    NSString *swizzledSelectorName = [NSString stringWithFormat:@"swizzled_%@", NSStringFromSelector(originalSelector)];
    SEL swizzledSelector = NSSelectorFromString(swizzledSelectorName);
    
    NSAssert([self instancesRespondToSelector:swizzledSelector], @"%@ not implemented and can't be swizzled", swizzledSelectorName);
    
    swizzleMethod(appDelegateClass, originalSelector, self, swizzledSelector);
}

- (BOOL)swizzled_application:(UIApplication *)application
                     openURL:(NSURL *)url
                     options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
    // TODO
    return [RCTLinkingManager application:application openURL:url options:options];
    return YES;
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
    UIResponder *nextResponder = [self respondsToSelector:@selector(swizzled_nextResponder)] ? [self swizzled_nextResponder] : nil;
    return  [[DHDevHelper sharedHelper] nextResponderInsteadOfResponder:nextResponder];
}

- (NSURL *)swizzled_sourceURLForBridge:(RCTBridge *)bridge
{
    return [BDEBundleURLProvider sharedProvider].entryURL;
}

@end
