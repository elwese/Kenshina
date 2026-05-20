module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Este plugin es OBLIGATORIO para que el Drawer y las animaciones funcionen
      'react-native-reanimated/plugin', 
    ],
  };
};