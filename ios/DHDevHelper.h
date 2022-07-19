#import <Foundation/Foundation.h>
#import <CoreGraphics/CGGeometry.h>

NS_ASSUME_NONNULL_BEGIN

@protocol UIMenuBuilder;
@class UIResponder;
@class RCTBridge;
@class DHMainWindowHandler;

@interface DHDevHelper : NSObject

+ (nullable DHDevHelper *)sharedHelper;
+ (BOOL)isRunningOnMac;

- (void)setupDevHelper;

- (void)setupDevMenuWithBridge:(RCTBridge *)bridge;

- (void)buildMenuWithBuilder:(id<UIMenuBuilder>)builder NS_AVAILABLE_IOS(13.0);

- (UIResponder *)nextResponderInsteadOfResponder:(UIResponder *)nextResponder;

- (void)toggleFloatOnTop;

@property (strong, nonatomic, readonly) DHMainWindowHandler *windowHandler;

@end


@interface DHDevHelper (Settings)

@property (assign, nonatomic) BOOL floatOnTopSetting;
@property (assign, nonatomic) CGFloat backgroundAlpha;
@property (assign, nonatomic) BOOL backgroundIgnoresClicks;

@end

NS_ASSUME_NONNULL_END
