const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bolt Performance Optimization:
// Enable inline requires to defer execution of imported modules until they are actually used.
// This significantly reduces the initial bundle execution time on mobile startup, improving Time-To-Interactive (TTI).
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
