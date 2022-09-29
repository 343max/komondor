#!/bin/bash

set -ex

# package up komondor and test install

yarn run prepare-release
npm pack

cp komondor-*.tgz ~/Projects/PawdonMe/

cd ~/Projects/PawdonMe/

# git reset --hard

npm i komondor-*.tgz

cd ios
pod install

cd ..
npx komondor patch-xcodeproj
npx komondor patch-pods
