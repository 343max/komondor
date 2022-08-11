#import "BDEBundleURLProvider.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTReloadCommand.h>
#import <React/RCTUtils.h>
#if __has_include(<React/RCTDevMenu.h>)
#import <React/RCTDevMenu.h>
#endif

#import "DHDevHelper.h"
#import "Swizzle.h"

@interface BDEBundleURLProvider ()

@property (strong, nonatomic) RCTBundleURLProvider *originalProvider;

@property (strong, nonatomic) NSURL *packagerURL;

#if __has_include(<React/RCTDevMenu.h>)
@property (strong, nonatomic) RCTDevMenuItem *resetBundleEndpointMenuItem;
#endif

@end

@interface RCTBundleURLProvider (Swizzling)
@end

@implementation RCTBundleURLProvider (Swizzling)

+ (id)swizzledSharedSettings
{
    return [BDEBundleURLProvider sharedProvider];
}

@end

@implementation BDEBundleURLProvider

+ (void)swizzle;
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        swizzleClassMethod([RCTBundleURLProvider class],
                           @selector(sharedSettings),
                           @selector(swizzledSharedSettings));
    });
}

- (instancetype)init
{
    self = [super init];
    
    if (self) {
        _originalProvider = [[RCTBundleURLProvider alloc] init];
        
        [self configureInternalPicker];
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(addDevMenuItem:)
                                                     name:RCTJavaScriptWillStartExecutingNotification
                                                   object:nil];
    }
    
    return self;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)addDevMenuItem:(NSNotification *)notification
{
#if __has_include(<React/RCTDevMenu.h>)
    RCTBridge *bridge = notification.object;
    
    _resetBundleEndpointMenuItem = [RCTDevMenuItem buttonItemWithTitleBlock:^NSString *{
        return @"🏠 Bundle Picker";
    } handler:^{
        [[BDEBundleURLProvider sharedProvider] switchToInternalPicker];
    }];
    [bridge.devMenu addItem:_resetBundleEndpointMenuItem];
#endif
}

+ (BDEBundleURLProvider *)sharedProvider
{
    static BDEBundleURLProvider *sharedProvider = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      sharedProvider = [[BDEBundleURLProvider alloc] init];
    });
    return sharedProvider;
}

- (NSURL *)entryURL
{
    return [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                             packagerHost:[self packagerServerHostPort]
                                           packagerScheme:[self packagerScheme]
                                                enableDev:[self enableDev]
                                       enableMinification:[self enableMinification]
                                              modulesOnly:NO
                                                runModule:YES];
}

- (NSString *)packagerScheme
{
    return _packagerURL.scheme;
}

- (nonnull NSURL *)jsBundleURLForBundleRoot:(nonnull NSString *)bundleRoot {
    return [RCTBundleURLProvider jsBundleURLForBundleRoot:bundleRoot
                                             packagerHost:[self packagerServerHostPort]
                                           packagerScheme:[self packagerScheme]
                                                enableDev:[self enableDev]
                                       enableMinification:[self enableMinification]
                                              modulesOnly:NO
                                                runModule:YES];
}

- (nonnull NSURL *)jsBundleURLForSplitBundleRoot:(nonnull NSString *)bundleRoot {
    return [RCTBundleURLProvider jsBundleURLForBundleRoot:bundleRoot
                                             packagerHost:[self packagerServerHostPort]
                                           packagerScheme:[self packagerScheme]
                                                enableDev:[self enableDev]
                                       enableMinification:[self enableMinification]
                                              modulesOnly:YES
                                                runModule:NO];
}

- (nonnull NSString *)packagerServerHostPort {
    return [self packagerServerHost:_packagerURL.host port:_packagerURL.port.unsignedIntegerValue];
}

- (nonnull NSString *)packagerServerHost:(NSString *)host port:(NSUInteger)port
{
    return [NSString stringWithFormat:@"%@:%li", host, port];
}

- (void)resetToDefaults {
    [self switchToInternalPicker];
}

- (BOOL)enableDev
{
    return YES;
}

- (BOOL)enableMinification
{
    return NO;
}

- (void)switchToBundle:(NSURL *)bundle
{
    
}

- (void)switchToPackagerHost:(NSString *)host port:(NSUInteger)port scheme:(NSString *)scheme
{
    _packagerURL = [NSURL URLWithString:[NSString stringWithFormat:@"%@://%@:%lu/", scheme, host, port]];
    NSURL *url = [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                                   packagerHost:[self packagerServerHost:host port:port]
                                                 packagerScheme:scheme
                                                      enableDev:YES
                                             enableMinification:NO
                                                    modulesOnly:NO
                                                      runModule:YES];
    [self reloadWithBundleURL:url];
}

- (void)switchToInternalPicker
{
    [self configureInternalPicker];
    NSURL *url = [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                                   packagerHost:[self packagerServerHostPort]
                                                 packagerScheme:_packagerURL.scheme
                                                      enableDev:YES
                                             enableMinification:NO
                                                    modulesOnly:NO
                                                      runModule:YES];
    [self reloadWithBundleURL:url];
}

- (NSString *)guessPackagerHost
{
#if TARGET_OS_SIMULATOR
    return @"localhost"
#else
    if ([DHDevHelper isRunningOnMac]) {
        return @"localhost";
    } else {
        static NSString *ipGuess;
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            NSString *ipPath = [[NSBundle mainBundle] pathForResource:@"ip" ofType:@"txt"];
            ipGuess =
            [[NSString stringWithContentsOfFile:ipPath encoding:NSUTF8StringEncoding
                                          error:nil] stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
        });
        
        NSString *host = ipGuess ?: @"localhost";
        return host;
    }
#endif
}

- (NSURL *)pickerDevelopementUrl
{
    return [NSURL URLWithString:[NSString stringWithFormat:@"http://%@:8042/", [self guessPackagerHost]]];
}

- (NSURL *)pickerBundleUrl
{
    return [self pickerDevelopementUrl];
}

- (BOOL)showsInternalPicker
{
    return [_packagerURL isEqual:[self pickerBundleUrl]];
}

- (void)configureInternalPicker
{
    _packagerURL = [self pickerBundleUrl];
}

- (void)reloadWithBundleURL:(NSURL *)bundleURL
{
    RCTExecuteOnMainQueue(^{
        RCTReloadCommandSetBundleURL(bundleURL);
        RCTTriggerReloadCommandListeners(@"Dev switched bundle");
    });
}

@end
