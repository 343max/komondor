//
//  RNNetService.h
//  RNZeroconf
//
//  Created by Jeremy White on 7/1/2016.
//  Copyright © 2016 Balthazar Gronon MIT
//

#if KOMONDOR_ENABLED

#import <Foundation/Foundation.h>

FOUNDATION_EXPORT const NSString *kKDRServiceKeysName;
FOUNDATION_EXPORT const NSString *kKDRServiceKeysFullName;
FOUNDATION_EXPORT const NSString *kKDRServiceKeysAddresses;
FOUNDATION_EXPORT const NSString *kKDRServiceKeysHost;
FOUNDATION_EXPORT const NSString *kKDRServiceKeysPort;
FOUNDATION_EXPORT const NSString *kKDRServiceTxtRecords;

@interface KDRNetServiceSerializer : NSObject

+ (NSDictionary *)serializeServiceToDictionary:(NSNetService *)service;

@end

#endif
