const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const localSdkPath = path.resolve(projectRoot, '..');
const useLocal = process.env.USE_LOCAL_WIDGET === '1';

const config = getDefaultConfig(projectRoot);

if (useLocal) {
  // Allow Metro to resolve the local SDK package instead of the one in node_modules
  config.watchFolders = [...(config.watchFolders || []), localSdkPath];
  config.resolver ??= {};
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    '@qiscus-community/react-native-multichannel-widget': localSdkPath,
  };
}

module.exports = config;

