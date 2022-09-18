#!/bin/bash

set -ex

# package up komondor and test install

yarn build:bin
npm pack
rm -rf /tmp/testinstall

cd ~/Projects/PawdonMe/

git reset --hard

npm i ~/Projects/komondor/komondor-*.tgz

npx komondor patch-xcodeproj

cd ios
pod install
