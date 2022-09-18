#import "KDRDevMenu.h"

#import "KDRDevHelper.h"
#import "array_map.h"
#import "KDRMainWindowHandler.h"

#import <React/RCTBridge.h>

#if __has_include(<React/RCTDevMenu.h>)
#import <React/RCTDevMenu.h>
#endif

@interface RCTDevMenu ()
- (NSArray<RCTDevMenuItem *> *)_menuItemsToPresent;
@end

@interface AppDelegate : NSObject
- (void)toggleStayOnTop;
@end

@interface MenuAction : NSObject

@property (assign, nonatomic, readonly) SEL selector;
@property (strong, nonatomic) dispatch_block_t handler;

- (instancetype)initWithHandler:(dispatch_block_t)handler;

@end

@implementation MenuAction

- (instancetype)initWithHandler:(dispatch_block_t)handler
{
  self = [super init];
  if (self) {
    _handler = handler;
    NSString *sel = [NSString stringWithFormat:@"handler_%lx", (unsigned long)self];
    _selector = NSSelectorFromString(sel);
  }
  return self;
}

@end

@interface MenuResponder : UIResponder

@property (weak, nonatomic) UIResponder *_nextResponder;
@property (strong, nonatomic, readonly) NSMutableArray *handlers;

- (SEL)generateSelector:(dispatch_block_t)handler;

@end

@implementation MenuResponder

- (instancetype)init
{
  self = [super init];
  if (self) {
    _handlers = [NSMutableArray array];
  }
  return self;
}

- (UIResponder *)nextResponder
{
  return __nextResponder;
}

- (MenuAction *)actionForSelector:(SEL)selector
{
  NSUInteger index = [_handlers indexOfObjectPassingTest:^BOOL(MenuAction *action, NSUInteger idx, BOOL * _Nonnull stop) {
    if (action.selector == selector) {
      *stop = YES;
      return YES;
    } else {
      return NO;
    }
  }];
  
  if (index == NSNotFound) {
    return  nil;
  } else {
    return _handlers[index];
  }
}

- (BOOL)respondsToSelector:(SEL)aSelector
{
  if ([self actionForSelector:aSelector]) {
    return YES;
  } else {
    return [super respondsToSelector:aSelector];
  }
}

- (id)performSelector:(SEL)aSelector withObject:(id)object
{
  MenuAction *action = [self actionForSelector:aSelector];
  if (action) {
    action.handler();
    return nil;
  } else {
    return [super performSelector:aSelector withObject:object];
  }
}

- (SEL)generateSelector:(dispatch_block_t)handler
{
  MenuAction *action = [[MenuAction alloc] initWithHandler:handler];
  [_handlers addObject:action];
  return action.selector;
}

@end

@interface KDRDevMenu (MenuGenerators)
- (UIMenuElement *)resizeMenuForTitle:(NSString *)title size:(CGSize)size;
- (UIMenuElement *)alphaMenuForTitle:(NSString *)title alpha:(CGFloat)alpha;
@end


@interface KDRDevMenu ()

@property (strong, nonatomic) UIMenu *devMenu NS_AVAILABLE_IOS(13.0);
@property (strong, nonatomic) MenuResponder *menuResponder;
@property (weak, nonatomic, readonly) RCTBridge *bridge;

@end

@interface RCTDevMenuItem ()

- (void)callHandler;
- (NSString *)title;

@end

@implementation KDRDevMenu

+ (BOOL)isRunningOnMac
{
  if (@available(iOS 14.0, *)) {
    return [NSProcessInfo processInfo].isiOSAppOnMac;
  } else {
    return false;
  }
}

- (instancetype)initWithBridge:(RCTBridge *)bridge
{
  self = [super init];
  if (self) {
    _bridge = bridge;
  }
  return self;
}

- (void)setupWithBuilder:(id<UIMenuBuilder>)builder NS_AVAILABLE_IOS(13.0);
{
  _menuResponder = [[MenuResponder alloc] init];
  
  SEL floatOnTopAction = [_menuResponder generateSelector:^{
    [[KDRDevHelper sharedHelper] toggleFloatOnTop];
    [[UIMenuSystem mainSystem] setNeedsRebuild];
  }];
  
  UICommand *stayOnTop = [UICommand commandWithTitle:@"Float On Top"
                                                  image:nil
                                                 action:floatOnTopAction
                                           propertyList:nil];
  
  stayOnTop.state = [KDRDevHelper sharedHelper].floatOnTopSetting ? UIMenuElementStateOn : UIMenuElementStateOff;
  
  __weak KDRDevMenu *weakSelf = self;
  SEL showDevMenuAction = [_menuResponder generateSelector:^{
    [[weakSelf rctDevMenu] show];
  }];
  
  UICommand *showDevMenu = [UIKeyCommand commandWithTitle:@"Show RN Dev Menu"
                                                    image:nil
                                                   action:showDevMenuAction
                                                    input:@"Z"
                                            modifierFlags:UIKeyModifierCommand | UIKeyModifierControl
                                             propertyList:nil];
  
  NSArray *devMenuItems = array_map([KDRDevMenu devMenuItemsForBridge:_bridge], ^id _Nonnull(RCTDevMenuItem *item, NSUInteger idx) {
    NSString *keyEquivalent = nil;
    NSString *title = [item title];
    if ([title isEqualToString:@"Reload"]) {
      keyEquivalent = @"r";
    }
      
    SEL action = [self.menuResponder generateSelector:^{
      [item callHandler];
      [[UIMenuSystem mainSystem] setNeedsRebuild];
    }];
        
    if (keyEquivalent == nil) {
      return [UICommand commandWithTitle:title
                                   image:nil
                                  action:action
                            propertyList:nil];
    } else {
      return [UIKeyCommand commandWithTitle:title
                                      image:nil
                                     action:action
                                      input:keyEquivalent
                              modifierFlags:UIKeyModifierCommand
                               propertyList:nil];
    }
  }).mutableCopy ;
  
  UIMenu *resizeMenu = [UIMenu menuWithTitle:@"Resize"
                                    children:@[
    [self resizeMenuForTitle:@"iPhone 12" size:CGSizeMake(390, 844)],
    [self resizeMenuForTitle:@"iPhone 12 mini" size:CGSizeMake(375, 812)],
    [self resizeMenuForTitle:@"iPhone 12 max" size:CGSizeMake(428, 926)],
    [self resizeMenuForTitle:@"iPhone SE" size:CGSizeMake(375, 667)]
  ]];
  
  SEL ignoresClicksAction = [self.menuResponder generateSelector:^{
    [KDRDevHelper sharedHelper].backgroundIgnoresClicks = ![KDRDevHelper sharedHelper].backgroundIgnoresClicks;
    [[UIMenuSystem mainSystem] setNeedsRebuild];
  }];
  
  UICommand *ignoresClicksMenu = [UICommand commandWithTitle:@"Ignores Clicks"
                                                       image:nil
                                                      action:ignoresClicksAction
                                                propertyList:nil];
  ignoresClicksMenu.state = [KDRDevHelper sharedHelper].backgroundIgnoresClicks ? UIMenuElementStateOn : UIMenuElementStateOff;
  
  UIMenu *windowAlphaMenu = [UIMenu menuWithTitle:@"Inactive Window"
                                         children:@[
    ignoresClicksMenu,
    [self alphaMenuForTitle:@"Alpha 100%" alpha:1.0],
    [self alphaMenuForTitle:@"Alpha 75%" alpha:0.75],
    [self alphaMenuForTitle:@"Alpha 50%" alpha:0.5],
    [self alphaMenuForTitle:@"Alpha 25%" alpha:0.25]
  ]];
 
  NSArray *menuItems = [@[
    stayOnTop,
    resizeMenu,
    windowAlphaMenu,
    showDevMenu,
  ] arrayByAddingObjectsFromArray:devMenuItems];

  _devMenu = [UIMenu menuWithTitle:@"Dev" children:menuItems];
  
  [builder insertSiblingMenu:_devMenu beforeMenuForIdentifier:UIMenuHelp];
}

- (id)nextResponderInsteadOfResponder:(id)nextResponder
{
  _menuResponder._nextResponder = nextResponder;
  return _menuResponder;
}

#if __has_include(<React/RCTDevMenu.h>)
- (RCTDevMenu *)rctDevMenu
{
  return [_bridge moduleForName:@"DevMenu"];
}

+ (NSArray<RCTDevMenuItem *> *)devMenuItemsForBridge:(RCTBridge *)bridge
{
  RCTDevMenu *devMenu = [bridge moduleForName:@"DevMenu"];
  return [devMenu _menuItemsToPresent];
}

#else
- (RCTDevMenu *)rctDevMenu
{
  return nil;
}


+ (NSArray<RCTDevMenuItem *> *)devMenuItemsForBridge:(RCTBridge *)bridge
{
  return @[];
}
#endif

@end

@implementation KDRDevMenu (MenuGenerators)

- (UIMenuElement *)resizeMenuForTitle:(NSString *)title size:(CGSize)size
{
  SEL action = [_menuResponder generateSelector:^{
    [[KDRDevHelper sharedHelper].windowHandler setWindowSize:size animated:YES];
  }];
  
  return [UICommand commandWithTitle:title
                               image:nil
                              action:action
                        propertyList:nil];
}

- (UIMenuElement *)alphaMenuForTitle:(NSString *)title alpha:(CGFloat)alpha
{
  SEL action = [_menuResponder generateSelector:^{
    [KDRDevHelper sharedHelper].backgroundAlpha = alpha;
    [[UIMenuSystem mainSystem] setNeedsRebuild];
  }];
  
  UICommand *command = [UICommand commandWithTitle:title
                                             image:nil
                                            action:action
                                      propertyList:nil];
  
  command.state = [KDRDevHelper sharedHelper].backgroundAlpha == alpha ? UIMenuElementStateOn : UIMenuElementStateOff;
  
  return command;
}


@end
