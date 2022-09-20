#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

#if KOMONDOR_ENABLED

@class Komondor;

@interface KDRBonjourScanner : NSObject

- (instancetype)initWithKomondor:(Komondor *)komondor
                            type:(NSString *)type
                        protocol:(NSString *)protocol
                          domain:(NSString *)domain;

@end

#endif

NS_ASSUME_NONNULL_END
