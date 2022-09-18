#import <Foundation/Foundation.h>
#import <CoreGraphics/CGGeometry.h>

NS_ASSUME_NONNULL_BEGIN

@protocol UIMenuBuilder;
@class UIResponder;
@class RCTBridge;
@class KDRMainWindowHandler;

@interface KDRDevHelper : NSObject

+ (nullable KDRDevHelper *)sharedHelper;
+ (BOOL)isRunningOnMac;

- (void)setupDevHelper;

- (void)setupDevMenuWithBridge:(RCTBridge *)bridge;

- (void)buildMenuWithBuilder:(id<UIMenuBuilder>)builder NS_AVAILABLE_IOS(13.0);

- (UIResponder *)nextResponderInsteadOfResponder:(UIResponder *)nextResponder;

- (void)toggleFloatOnTop;

@property (strong, nonatomic, readonly) KDRMainWindowHandler *windowHandler;

@end


@interface KDRDevHelper (Settings)

@property (assign, nonatomic) BOOL floatOnTopSetting;
@property (assign, nonatomic) CGFloat backgroundAlpha;
@property (assign, nonatomic) BOOL backgroundIgnoresClicks;

@end

NS_ASSUME_NONNULL_END
