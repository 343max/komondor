#import <ifaddrs.h>
#import <sys/socket.h>
#import <arpa/inet.h>

#import "Komondor+IPAddresses.h"

@implementation Komondor (IPAddresses)

- (NSSet<NSString *> *)_getIPAddresses {

    NSMutableSet<NSString *> *addresses = [NSMutableSet set];
    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    // retrieve the current interfaces - returns 0 on success
    BOOL success = getifaddrs(&interfaces) == 0;
    if (success) {
        // Loop through linked list of interfaces
        temp_addr = interfaces;
        while(temp_addr != NULL) {
            if(temp_addr->ifa_addr->sa_family == AF_INET) {
                char *inetAddr = inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr);
                [addresses addObject:[NSString stringWithUTF8String:inetAddr]];
            }

            temp_addr = temp_addr->ifa_next;
        }
    }
    // Free memory
    freeifaddrs(interfaces);
    return [addresses copy];

}

RCT_REMAP_METHOD(myIPAddresses, myIPAddressesWithResolver:(RCTPromiseResolveBlock)resolve
                                             withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSSet *addresses = [self _getIPAddresses];
    resolve([addresses allObjects]);
}

@end
