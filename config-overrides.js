const path = require("path");
const { NormalModuleReplacementPlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

const brandPath = `branding/${process.env.REACT_APP_BRAND}`;

module.exports = function override(config) {
  config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

  config.resolve.modules.push(path.resolve(__dirname, brandPath));

  config.plugins.push(new NodePolyfillPlugin());

  config.plugins.push(new CopyPlugin({
    patterns: [{ from: `${brandPath}/public`, to: "." }]
  }));

  if (process.env.REACT_APP_VC_CREATE_ADHOC_ROOM_ENABLED === 'true') {
    const screenPath = 'features/VidyoConnector/AdHocRoom/screens/AdHocBeautyScreen';
    config.plugins.push(new NormalModuleReplacementPlugin(
      /(.*)GuestInitialScreen(\.*)/,
      function (resource) {
        resource.request = screenPath;
      }
    ));
  }

  return config;
};
