const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Bolt Performance Optimization:
// Enable inlineRequires in Metro bundler to defer module execution until required at runtime.
// This significantly improves initial mobile application startup time and Time-to-Interactive (TTI).
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
