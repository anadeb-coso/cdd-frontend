module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Requis par les décorateurs @nozbe/watermelondb (@field, @date, @json…) des modèles
      // COSOCollect (src/database/collect/models/*.js) — mêmes réglages que l'app mobile du MGP.
      ['@babel/plugin-proposal-decorators', { legacy: true }],
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
            '@': './src',
          },
        },
      ],
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }],
      // [
      //   "module:@rnmapbox/maps",
      //   {
      //     "RNMapboxMapsVersion": "10.1.29"
      //   }
      // ],
      // [
      //   "expo-location",
      //   {
      //     "locationWhenInUsePermission": "Show current location on map."
      //   }
      // ]
    ],
  };
};
