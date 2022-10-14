#import "KDRBundleURLProvider.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTReloadCommand.h>
#import <React/RCTUtils.h>
#import <React/RCTDevSettings.h>
#if __has_include(<React/RCTDevMenu.h>)
#import <React/RCTDevMenu.h>
#endif

#import "KDRDevHelper.h"
#import "Swizzle.h"

#if KOMONDOR_ENABLED

@interface KDRBundleURLProvider ()

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
    return [KDRBundleURLProvider sharedProvider];
}

@end

@implementation KDRBundleURLProvider

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
    }
    
    return self;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

+ (KDRBundleURLProvider *)sharedProvider
{
    static KDRBundleURLProvider *sharedProvider = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedProvider = [[KDRBundleURLProvider alloc] init];
    });
    return sharedProvider;
}

- (NSURL *)entryURL
{
    if ([_packagerURL.scheme isEqualToString:@"file"]) {
        return _packagerURL;
    } else {
        return [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                                 packagerHost:[self packagerServerHostPort]
                                               packagerScheme:[self packagerScheme]
                                                    enableDev:[self enableDev]
                                           enableMinification:[self enableMinification]
                                                  modulesOnly:NO
                                                    runModule:YES];
    }
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
    // TODO Switch to bundle
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
    [self reloadWithBundleURL:_packagerURL];
}

- (NSURL *)pickerBundleUrl
{
#if KOMONDOR_DEV_PACKAGER
    return [RCTBundleURLProvider jsBundleURLForBundleRoot:@"index"
                                             packagerHost:@"localhost:8042"
                                           packagerScheme:@"http"
                                                enableDev:YES
                                       enableMinification:NO
                                              modulesOnly:NO
                                                runModule:YES];
#else
    return [[NSBundle mainBundle] URLForResource:@"komondor" withExtension:@"jsbundle"];
#endif
}

- (BOOL)showsInternalPicker
{
    return [_packagerURL isEqual:[self pickerBundleUrl]];
}

- (void)configureInternalPicker
{
    _packagerURL = [self pickerBundleUrl];
    [self setDevSettingsEnalbedForURL:_packagerURL];
}

- (void)setDevSettingsEnalbedForURL:(NSURL *)bundleURL
{
    BOOL enableDevSettings = ![bundleURL.scheme isEqualToString:@"file"];
    RCTDevSettingsSetEnabled(enableDevSettings);
}

- (void)reloadWithBundleURL:(NSURL *)bundleURL
{
    RCTExecuteOnMainQueue(^{
        [self setDevSettingsEnalbedForURL:bundleURL];
        RCTReloadCommandSetBundleURL(bundleURL);
        RCTTriggerReloadCommandListeners(@"Dev switched bundle");
    });
}

@end

#endif
