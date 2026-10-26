const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bolt Performance Optimization:
// Enable inline requires to significantly improve mobile startup performance.
// This lazily loads JavaScript modules when they are first evaluated, rather than eagerly at startup.
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: true,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
