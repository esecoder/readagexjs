#!/bin/bash

npm init -y

npm i -D ts-node typescript
npm install --save-dev eslint
npm install @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev
npm i --save-dev @types/debug
npm i -D debug
npm install --save-dev ts-jest @types/jest

# Generate a tsconfig.json file
npx tsc --init
npx ts-jest config:init