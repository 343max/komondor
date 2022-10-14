#!/bin/bash

set -ex

# package up komondor and test install

yarn run prepare-release
npm pack

cp komondor-*.tgz ~/Projects/TodoToday/

cd ~/Projects/TodoToday/

# git reset --hard

npm i komondor-*.tgz

cd ios
pod install

cd ..
npx komondor patch-xcodeproj
npx komondor patch-pods
