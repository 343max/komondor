#import "KDRMainWindowHandler.h"

#import "AppKitHeaders.h"

@interface KDRMainWindowHandler ()

@property (nonatomic, weak) NSWindow *mainWindow;

@end

@implementation KDRMainWindowHandler

+ (BOOL)isUIKitWindow:(NSWindow *)window
{
  return [window isKindOfClass:NSClassFromString(@"UINSWindow")];
}

- (instancetype)initWithFloatOnTop:(BOOL)floatOnTop
                   backgroundAlpha:(CGFloat)backgroundAlpha
           backgroundIgnoresClicks:(BOOL)backgroundIgnoresClicks
{
  self = [super init];
  
  if (self) {
    _floatOnTop = floatOnTop;
    _backgroundAlpha = backgroundAlpha;
    _backgroundIgnoresClicks = backgroundIgnoresClicks;
    
    __weak KDRMainWindowHandler *weakSelf = self;
    [[NSNotificationCenter defaultCenter] addObserverForName:@"NSWindowDidBecomeMainNotification"
                                                      object:nil
                                                       queue:[NSOperationQueue mainQueue]
                                                  usingBlock:^(NSNotification * _Nonnull note) {
      if ([KDRMainWindowHandler isUIKitWindow:note.object]) {
        weakSelf.mainWindow = note.object;
        [weakSelf _setFloatOnTop:weakSelf.floatOnTop];
      }
    }];
    
    [[NSNotificationCenter defaultCenter] addObserverForName:@"NSWindowDidBecomeKeyNotification"
                                                      object:nil
                                                       queue:[NSOperationQueue mainQueue]
                                                  usingBlock:^(NSNotification * _Nonnull note) {
      if ([KDRMainWindowHandler isUIKitWindow:note.object]) {
        weakSelf.mainWindow = note.object;
        weakSelf.mainWindow.alphaValue = 1.0;
        weakSelf.mainWindow.ignoresMouseEvents = NO;
      }
    }];
    [[NSNotificationCenter defaultCenter] addObserverForName:@"NSWindowDidResignKeyNotification"
                                                      object:nil
                                                       queue:[NSOperationQueue mainQueue]
                                                  usingBlock:^(NSNotification * _Nonnull note) {
      if ([KDRMainWindowHandler isUIKitWindow:note.object]) {
        weakSelf.mainWindow = note.object;
        weakSelf.mainWindow.alphaValue = weakSelf.backgroundAlpha;
        weakSelf.mainWindow.ignoresMouseEvents = weakSelf.backgroundIgnoresClicks;
      }
    }];
  }
  
  return self;
}

- (void)dealloc
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)setFloatOnTop:(BOOL)floatOnTop
{
  _floatOnTop = floatOnTop;
  [self _setFloatOnTop:floatOnTop];
}

- (void)_setFloatOnTop:(BOOL)floatOnTop
{
  [self.mainWindow setLevel:floatOnTop ? NSModalPanelWindowLevel : NSNormalWindowLevel];
}

- (void)setBackgroundAlpha:(CGFloat)backgroundAlpha
{
  _backgroundAlpha = backgroundAlpha;
  if (!_mainWindow.keyWindow) {
    _mainWindow.alphaValue = backgroundAlpha;
  }
}

- (void)setBackgroundIgnoresClicks:(BOOL)backgroundIgnoresClicks
{
  _backgroundIgnoresClicks = backgroundIgnoresClicks;
  if (!_mainWindow.keyWindow) {
    _mainWindow.ignoresMouseEvents = backgroundIgnoresClicks;
  }
}

- (void)setWindowSize:(CGSize)windowSize
{
  [self setWindowSize:windowSize animated:NO];
}

- (void)setWindowSize:(CGSize)windowSize animated:(BOOL)animated
{
  CGRect frame = self.mainWindow.frame;
  frame.size = windowSize;
  [self.mainWindow setFrame:frame display:YES animate:animated];
}

@end
