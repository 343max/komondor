#import "RCTSRWebSocket+Komondor.h"

#import "Swizzle.h"

@implementation RCTSRWebSocket (Komondor)

#if KOMONDOR_ENABLED

+ (void)swizzle
{
    swizzleMethod(self, @selector(initWithURL:protocols:), self, @selector(swizzled_initWithURL:protocols:));
}

- (instancetype)swizzled_initWithURL:(NSURL *)URL protocols:(NSArray<NSString *> *)protocols
{
    if (URL == nil || [URL.scheme isEqualToString:@"file"]) {
        return nil;
    } else {
        return [self swizzled_initWithURL:URL protocols:protocols];
    }
}

#endif

@end
