#!/opt/homebrew/bin/fish

# package up komondor and test install

yarn build:bin
npm pack
rm -rf /tmp/testinstall
mkdir -p /tmp/testinstall
cd /tmp/testinstall

echo "{\"name\": \"testinstall\", \"version\": \"1.0.0\", \"description\": \"\", \"main\": \"index.js\", \"scripts\": { \"test\": \"exit 1\" }, \"author\": \"\", \"license\": \"ISC\"}" > package.json
npm i ~/Projects/BetterDevExp/better-dev-exp-0.1.0.tgz

npx komondor
