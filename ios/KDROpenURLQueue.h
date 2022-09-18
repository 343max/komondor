#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *const KDROpenURLQueueChangeNotification;

@interface KDROpenURLQueue : NSObject

+ (instancetype)sharedQueue;

@property (strong, nonatomic, readonly) NSArray<NSURL *> *queue;
@property (strong, nonatomic, readonly) NSArray<NSString *> *stringQueue;

- (void)add:(NSURL *)url;
- (void)flush;

@end

NS_ASSUME_NONNULL_END
