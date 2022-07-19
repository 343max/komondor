#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>

@class RCTBridge;

NS_ASSUME_NONNULL_BEGIN

@interface BDEAppDelegateSwizzle : NSObject <UIApplicationDelegate>

+ (void)swizzle;

@end

NS_ASSUME_NONNULL_END
