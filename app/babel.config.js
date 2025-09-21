    // babel.config.js
    module.exports = function(api) {
      api.cache(true);
      return {
        presets: [
          'babel-preset-expo',
          'nativewind/babel'
        ],
        plugins: [
          // This is important for Expo Router
          'expo-router/babel',
        ],
      };
    };