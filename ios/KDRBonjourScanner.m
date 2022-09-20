#import "KDRBonjourScanner.h"
#import "Komondor.h"
#import "KDRNetServiceSerializer.h"

#if KOMONDOR_ENABLED

@interface KDRBonjourScanner ()

@property (nonatomic, strong, readonly) NSNetServiceBrowser *browser;
@property (nonatomic, weak, readonly) Komondor *komondor;
@property (nonatomic, strong, readonly) NSMutableSet *services;

@end

@interface KDRBonjourScanner (NSNetServiceBrowserDelegate) <NSNetServiceBrowserDelegate>
@end

@interface KDRBonjourScanner (NSNetServiceDelegate) <NSNetServiceDelegate>
@end


@implementation KDRBonjourScanner

- (instancetype)initWithKomondor:(Komondor *)komondor
                            type:(NSString *)type
                        protocol:(NSString *)protocol
                          domain:(NSString *)domain
{
    self = [super init];
    
    if (self) {
        _komondor = komondor;
        _services = [NSMutableSet set];
        _browser = [[NSNetServiceBrowser alloc] init];
        _browser.delegate = self;
        [_browser searchForServicesOfType:[NSString stringWithFormat:@"_%@._%@.", type, protocol]
                                 inDomain:domain];
    }
    
    return self;
}

- (void)dealloc
{
    [_browser stop];
}

@end

@implementation KDRBonjourScanner (NSNetServiceBrowserDelegate)

- (void)netServiceBrowserWillSearch:(NSNetServiceBrowser *)browser
{
    [_komondor sendEventWithName:@"bonjourBrowserWillSearch" body:nil];
}

- (void)netServiceBrowserDidStopSearch:(NSNetServiceBrowser *)browser
{
    [_komondor sendEventWithName:@"bonjourBrowserDidStopSearch" body:nil];
}

- (void)netServiceBrowser:(NSNetServiceBrowser *)browser didNotSearch:(NSDictionary<NSString *,NSNumber *> *)errorDict
{
    [_komondor sendEventWithName:@"bonjourBrowserDidNotSearch" body:errorDict];
}

- (void)netServiceBrowser:(NSNetServiceBrowser *)browser didFindService:(NSNetService *)service moreComing:(BOOL)moreComing
{
    if (service) {
        [_services addObject:service];
        service.delegate = self;
        [service resolveWithTimeout:5.0];
        [_komondor sendEventWithName:@"bonjourBrowserDidFindService"
                                body:[KDRNetServiceSerializer serializeServiceToDictionary:service]];
    }
}

- (void)netServiceBrowser:(NSNetServiceBrowser *)browser didRemoveService:(NSNetService *)service moreComing:(BOOL)moreComing
{
    if (service) {
        NSLog(@"didRemoveService: %@", service);
        [_services removeObject:service];
        [_komondor sendEventWithName:@"bonjourBrowserDidRemoveService"
                                body:[KDRNetServiceSerializer serializeServiceToDictionary:service]];
    }
}

@end

@implementation KDRBonjourScanner (NSNetServiceDelegate)

- (void)netServiceDidResolveAddress:(NSNetService *)sender
{
    NSLog(@"netServiceDidResolveAddress: %@", sender);
    [_komondor sendEventWithName:@"bonjourBrowserDidResolveAddress"
                            body:[KDRNetServiceSerializer serializeServiceToDictionary:sender]];
}

- (void)netService:(NSNetService *)sender didNotResolve:(NSDictionary<NSString *,NSNumber *> *)errorDict
{
    NSLog(@"didNotResolve: %@ %@", sender, errorDict);
    [_komondor sendEventWithName:@"bonjourBrowserDidNotResolve"
                            body:
         @{
            @"service": [KDRNetServiceSerializer serializeServiceToDictionary:sender],
            @"error": errorDict
         }
    ];
}

@end

#endif
