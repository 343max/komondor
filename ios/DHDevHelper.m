#import "DHDevHelper.h"

#import "DHDevMenu.h"
#import "DHMainWindowHandler.h"
#import "BDEAppDelegate.h"
#import "BDEBundleURLProvider.h"

@interface DHDevHelper ()

@property (strong, nonatomic) DHDevMenu *devMenu;

@end

@implementation DHDevHelper

+ (nullable DHDevHelper *)sharedHelper;
{
  if (![self isRunningOnMac]) {
    return  nil;
  }
  static DHDevHelper *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [[DHDevHelper alloc] init];
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
    [BDEBundleURLProvider swizzle];
}

- (void)setupDevMenuWithBridge:(RCTBridge *)bridge
{
    _devMenu = [[DHDevMenu alloc] initWithBridge:bridge];
    _windowHandler = [[DHMainWindowHandler alloc] initWithFloatOnTop:self.floatOnTopSetting
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

@implementation DHDevHelper (Settings)

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
