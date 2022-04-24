module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['react-native-reanimated/plugin'],
      [
        'module-resolver',
        {
          alias: {
            assets: './src/assets',
            components: './src/components',
            constants: './src/constants',
            hooks: './src/hooks',
            routers: './src/routers',
            screens: './src/screens',
            store: './src/store',
            types: './src/types',
            utils: './src/utils',
          },
        },
      ],
    ],
  };
};
