#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#import "KDRAppDelegate.h"

@class KDRBonjourScanner;

@interface Komondor : RCTEventEmitter <RCTBridgeModule>

#if KOMONDOR_ENABLED
@property (strong, nonatomic, nullable) KDRBonjourScanner *scanner;
#endif

@end
