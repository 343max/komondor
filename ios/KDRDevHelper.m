#import "KDRDevHelper.h"

#import "KDRDevMenu.h"
#import "KDRMainWindowHandler.h"
#import "KDRBundleURLProvider.h"

#if KOMONDOR_ENABLED

@interface KDRDevHelper ()

@property (strong, nonatomic) KDRDevMenu *devMenu;

@end

@implementation KDRDevHelper

+ (nullable KDRDevHelper *)sharedHelper;
{
  if (![self isRunningOnMac]) {
    return  nil;
  }
  static KDRDevHelper *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[KDRDevHelper alloc] init];
  });
  return sharedInstance;
}

+ (BOOL)isRunningOnMac
{
  if (@available(iOS 14.0, *)) {
    return [NSProcessInfo processInfo].isiOSAppOnMac;
  } else {
    return false;
  }
}

- (void)setupDevHelper
{
    [KDRBundleURLProvider swizzle];
}

- (void)setupDevMenuWithBridge:(RCTBridge *)bridge
{
    _devMenu = [[KDRDevMenu alloc] initWithBridge:bridge];
    _windowHandler = [[KDRMainWindowHandler alloc] initWithFloatOnTop:self.floatOnTopSetting
                                                      backgroundAlpha:self.backgroundAlpha
                                              backgroundIgnoresClicks:self.backgroundIgnoresClicks];
    [[UIMenuSystem mainSystem] setNeedsRebuild];
}

- (void)buildMenuWithBuilder:(id<UIMenuBuilder>)builder NS_AVAILABLE_IOS(13.0);
{
  [_devMenu setupWithBuilder:builder];
}

- (UIResponder *)nextResponderInsteadOfResponder:(UIResponder *)nextResponder
{
  return [_devMenu nextResponderInsteadOfResponder:nextResponder];
}

- (void)toggleFloatOnTop
{
  BOOL floatOnTop = !self.floatOnTopSetting;
  self.floatOnTopSetting = floatOnTop;
  self.windowHandler.floatOnTop = floatOnTop;
}

@end

@implementation KDRDevHelper (Settings)

- (BOOL)floatOnTopSetting
{
  return [[NSUserDefaults standardUserDefaults] boolForKey:@"DEV_windowFloatOnTop"];
}

- (void)setFloatOnTopSetting:(BOOL)floatOnTopSetting
{
  [[NSUserDefaults standardUserDefaults] setBool:floatOnTopSetting
                                          forKey:@"DEV_windowFloatOnTop"];
}

- (CGFloat)backgroundAlpha
{
  return [[NSUserDefaults standardUserDefaults] floatForKey:@"DEV_windowBackgroundAlpha"] ?: 1.0;
}

- (void)setBackgroundAlpha:(CGFloat)alpha
{
  [[NSUserDefaults standardUserDefaults] setFloat:alpha forKey:@"DEV_windowBackgroundAlpha"];
  _windowHandler.backgroundAlpha = alpha;
}

- (BOOL)backgroundIgnoresClicks
{
  return [[NSUserDefaults standardUserDefaults] boolForKey:@"DEV_windowBackgroundIgnoresClicks"];
}

- (void)setBackgroundIgnoresClicks:(BOOL)backgroundIgnoresClicks
{
  [[NSUserDefaults standardUserDefaults] setBool:backgroundIgnoresClicks
                                          forKey:@"DEV_windowBackgroundIgnoresClicks"];
  _windowHandler.backgroundIgnoresClicks = backgroundIgnoresClicks;
}

@end

#endif
