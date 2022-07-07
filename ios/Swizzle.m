#import <objc/runtime.h>

#import "Swizzle.h"

extern void swizzleClassMethod(Class aClass, SEL originalSelector, SEL swizzledSelector)
{
    Method originalMethod = class_getClassMethod(aClass, originalSelector);
    Method swizzledMethod = class_getClassMethod(aClass, swizzledSelector);
    
    method_exchangeImplementations(originalMethod, swizzledMethod);
}
