module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-optional-chaining',  // add this
      'react-native-reanimated/plugin'               // keep last
    ]
  };
};