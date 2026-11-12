// Only needed for the browser preview (`expo export --platform web`). iOS and Android
// resolve @mal/design-system to its native entry with no config at all.
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const nativeEntry = path.dirname(require.resolve('@mal/design-system/package.json')) + '/src/index.native.ts';

// On web, a plain web app would get the Tailwind build. This app exists to demo the
// *native* components, so point it at the native entry, rendered by react-native-web.
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@mal/design-system') {
    return { type: 'sourceFile', filePath: nativeEntry };
  }
  return (resolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
