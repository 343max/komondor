#import "KDROpenURLQueue.h"

#import "array_map.h"

NSString *const KDROpenURLQueueChangeNotification = @"KDROpenURLQueueChangeNotification";

@implementation KDROpenURLQueue

+ (instancetype)sharedQueue
{
    static KDROpenURLQueue *sharedQueue = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        sharedQueue = [[KDROpenURLQueue alloc] init];
    });
    return sharedQueue;
}

- (instancetype)init
{
    self = [super init];
    
    if (self) {
        _queue = @[];
    }
    
    return self;
}

- (void)add:(NSURL *)url
{
    _queue = [_queue arrayByAddingObject:url];
    [[NSNotificationCenter defaultCenter] postNotificationName:KDROpenURLQueueChangeNotification
                                                        object:self
                                                      userInfo:@{
        @"type": @"queueAdded",
        @"body": @{ @"url": url.absoluteString }
    }];
}

- (void)flush
{
    _queue = @[];
}

- (NSArray<NSString *> *)stringQueue
{
    return array_map(_queue, ^id _Nonnull(NSURL *url, NSUInteger idx) {
        return url.absoluteString;
    });
}

@end
