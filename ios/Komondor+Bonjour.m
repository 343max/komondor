#import "Komondor+Bonjour.h"
#import "KDRBonjourScanner.h"

@implementation Komondor (Bonjour)

#if KOMONDOR_ENABLED

RCT_REMAP_METHOD(scan, scan:(NSString *__nonnull)type
                   protocol:(NSString *__nonnull)protocol
                     domain:(NSString *__nonnull)domain
               withResolver:(RCTPromiseResolveBlock)resolve
               withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        self.scanner = [[KDRBonjourScanner alloc] initWithKomondor:self
                                                              type:type
                                                          protocol:protocol
                                                            domain:domain];
    });
    resolve(nil);
}

RCT_REMAP_METHOD(stopScanning, stopScanningWithResolver:(RCTPromiseResolveBlock)resolve
                                           withRejecter:(RCTPromiseRejectBlock)reject)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        self.scanner = nil;
    });
    resolve(nil);
}

#endif

@end
