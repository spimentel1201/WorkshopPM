module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: [__dirname],
          alias: {
            '@': __dirname,
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
