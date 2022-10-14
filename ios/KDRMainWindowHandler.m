#import "KDRMainWindowHandler.h"
#import "AppKitHeaders.h"

#if KOMONDOR_ENABLED

@interface KDRMainWindowHandler ()

@property (nonatomic, weak) NSWindow *mainWindow;

@end

@implementation KDRMainWindowHandler

+ (BOOL)isUIKitWindow:(NSWindow *)window
{
    return [window isKindOfClass:NSClassFromString(@"UINSWindow")];
}

+ (NSWorkspace *)sharedWorkspace
{
    return [NSClassFromString(@"NSWorkspace") sharedWorkspace];
}

- (instancetype)initWithFloatOnTopBundleIdentifiers:(NSArray<NSString *> *)floatOnTopOfBundleIdentifiers
                                    backgroundAlpha:(CGFloat)backgroundAlpha
                            backgroundIgnoresClicks:(BOOL)backgroundIgnoresClicks
{
    self = [super init];
    
    if (self) {
        _floatOnTopOfBundleIdentifiers = floatOnTopOfBundleIdentifiers;
        _backgroundAlpha = backgroundAlpha;
        _backgroundIgnoresClicks = backgroundIgnoresClicks;
        
        __weak KDRMainWindowHandler *weakSelf = self;
        [[NSNotificationCenter defaultCenter] addObserverForName:@"NSWindowDidBecomeMainNotification"
                                                          object:nil
                                                           queue:[NSOperationQueue mainQueue]
                                                      usingBlock:^(NSNotification * _Nonnull note) {
            if ([KDRMainWindowHandler isUIKitWindow:note.object]) {
                weakSelf.mainWindow = note.object;
                [weakSelf updateFloatOnTop:[KDRMainWindowHandler sharedWorkspace].frontmostApplication];
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
        
        [[KDRMainWindowHandler sharedWorkspace].notificationCenter addObserverForName:@"NSWorkspaceDidActivateApplicationNotification"
                                                                               object:nil
                                                                                queue:[NSOperationQueue mainQueue]
                                                                           usingBlock:^(NSNotification * _Nonnull note) {
            NSRunningApplication *app = note.userInfo[@"NSWorkspaceApplicationKey"];
            
            [weakSelf updateFloatOnTop:app];
        }];
        
    }
    
    return self;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)setFloatOnTopOfBundleIdentifiers:(NSArray<NSString *> *)floatOnTopOfBundleIdentifiers
{
    _floatOnTopOfBundleIdentifiers = floatOnTopOfBundleIdentifiers;
    [self updateFloatOnTop:[KDRMainWindowHandler sharedWorkspace].frontmostApplication];
}

- (BOOL)shouldFloatOnTopApp:(NSRunningApplication *)frontApp
{
    NSLog(@"floatOnTop: %@", _floatOnTopOfBundleIdentifiers);
    if (_floatOnTopOfBundleIdentifiers.count == 0) {
        return NO;
    } else if ([_floatOnTopOfBundleIdentifiers isEqualToArray:@[@"everything"]]) {
        return YES;
    } else {
        return [_floatOnTopOfBundleIdentifiers containsObject:frontApp.bundleIdentifier];
    }
}

- (void)updateFloatOnTop:(NSRunningApplication *)frontApp
{
    BOOL floatOnTop = [self shouldFloatOnTopApp:frontApp];
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

#endif
