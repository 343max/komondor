#import <Foundation/Foundation.h>
#import <CoreGraphics/CGGeometry.h>

NS_ASSUME_NONNULL_BEGIN

@interface KDRMainWindowHandler : NSObject

@property (assign, nonatomic) CGFloat backgroundAlpha;
@property (assign, nonatomic) BOOL backgroundIgnoresClicks;

@property (assign, nonatomic) BOOL floatOnTop;
@property (assign, nonatomic) CGSize windowSize;

- (instancetype)initWithFloatOnTop:(BOOL)floatOnTop
                   backgroundAlpha:(CGFloat)backgroundAlpha
           backgroundIgnoresClicks:(BOOL)backgroundIgnoresClicks;

- (void)setWindowSize:(CGSize)windowSize animated:(BOOL)animated;

@end

NS_ASSUME_NONNULL_END
