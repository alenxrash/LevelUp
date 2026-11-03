// expo-sqlite's web backend (wa-sqlite) loads a .wasm file that Metro doesn't
// treat as an asset by default, which fails bundling for the web platform.
// https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/#usage-on-web
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('wasm');

module.exports = config;
