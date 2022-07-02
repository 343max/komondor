package com.betterdevexp;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;

public class BetterDevExpModule extends NativeBetterDevExpSpec {
  public static final String NAME = BetterDevExpModuleImpl.NAME;

  BetterDevExpModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  @NonNull
  public String getName() {
    return BetterDevExpModuleImpl.NAME;
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @Override
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
    BetterDevExpModuleImpl.multiply(a, b, promise);
  }
}
