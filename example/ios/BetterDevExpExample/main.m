#import <UIKit/UIKit.h>

#import <Komondor/Komondor.h>
#import "AppDelegate.h"

int main(int argc, char *argv[])
{
  @autoreleasepool {
    return KDRApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
