# better-dev-exp

Better Development Experience

## Installation

```sh
npm install better-dev-exp
```

## Installation

Add URL Scheme to Info.plist

```
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>$(PRODUCT_BUNDLE_IDENTIFIER)-better-dev-exp</string>
    </array>
  </dict>
</array>
```
