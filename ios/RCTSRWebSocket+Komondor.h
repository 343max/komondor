#import <React/RCTSRWebSocket.h>

NS_ASSUME_NONNULL_BEGIN

@interface RCTSRWebSocket (Komondor)

#if KOMONDOR_ENABLED

+ (void)swizzle;

#endif

@end

NS_ASSUME_NONNULL_END
