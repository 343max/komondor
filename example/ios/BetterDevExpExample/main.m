#import <UIKit/UIKit.h>

#import <BetterDevExp/BetterDevExp.h>
#import "AppDelegate.h"

int main(int argc, char *argv[])
{
  @autoreleasepool {
    return BDEApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
