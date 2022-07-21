#import <React/RCTBundleURLProvider.h>

NS_ASSUME_NONNULL_BEGIN

@protocol BundleURLProvider

@required
/**
 * Reset every settings to default.
 */
- (void)resetToDefaults;

/**
 * Return the server host with optional port. If its a development build and there's no jsLocation defined,
 * it will return the server host IP address
 */
- (NSString *)packagerServerHostPort;

/**
 * Returns the jsBundleURL for a given bundle entrypoint and
 * the fallback offline JS bundle if the packager is not running.
 */
- (NSURL *)jsBundleURLForBundleRoot:(NSString *)bundleRoot;

/**
 * Returns the jsBundleURL for a given split bundle entrypoint in development
 */
- (NSURL *)jsBundleURLForSplitBundleRoot:(NSString *)bundleRoot;

/**
 * The scheme/protocol used of the packager, the default is the http protocol
 */
@property (nonatomic, copy, readonly) NSString *packagerScheme;

@end


@interface BDEBundleURLProvider : NSObject <BundleURLProvider>

+ (void)swizzle;
   
+ (BDEBundleURLProvider *)sharedProvider;

@property (nonatomic, readonly) BOOL showsInternalPicker;

- (NSURL *)entryURL;

- (void)switchToPackagerHost:(NSString *)host port:(NSUInteger)port scheme:(NSString *)scheme;
- (void)switchToBundle:(NSURL *)bundle;
- (void)switchToInternalPicker;

- (void)withInternalPicker:(void (^)(void))afterLoadingBlock;

@end

NS_ASSUME_NONNULL_END
