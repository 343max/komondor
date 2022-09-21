#!/bin/bash

set -ex

# package up komondor and test install

yarn run prepare
npm pack

cd ~/Projects/PawdonMe/

# git reset --hard

npm i ~/Projects/komondor/komondor-*.tgz

cd ios
pod install

cd ..
npx komondor patch-xcodeproj
npx komondor patch-pods