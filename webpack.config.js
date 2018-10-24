var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
var path = require("path");
var webpack = require("webpack");
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
var WebpackNotifierPlugin = require("webpack-notifier");

var PROD = JSON.parse(process.env.PROD || false);
var BUNDLE_ANALYZER = JSON.parse(process.env.BUNDLE_ANALYZER || false);

module.exports = {
   mode: "none",
  devtool: "source-map",
   entry: {
     "clipboard-polyfill": "./clipboard-polyfill.ts",
     "clipboard-polyfill.promise": ["./clipboard-polyfill.promise.ts"]
   },
   module: {
     rules: [
       { test: /\.ts$/, use: "ts-loader" }
     ]
   },
   output: {
    path: __dirname + "/build",
    filename: "[name].js",
    library: "clipboard",
    libraryTarget: "umd",
    // Workaround for Webpack 4. See https://github.com/webpack/webpack/issues/6522#issuecomment-371120689
    globalObject: "typeof self !== \"undefined\" ? self : this"
   },
   resolve: {
    extensions: [".ts"],
    modules: ["node_modules"]
   },
   plugins: [
     new WebpackNotifierPlugin({alwaysNotify: true})
   ]
};

if (BUNDLE_ANALYZER) {
  module.exports.plugins.push(new BundleAnalyzerPlugin());
}

if (PROD) {
  // https://webpack.js.org/concepts/mode/#mode-production
  module.exports.plugins.push(
    new UglifyJSPlugin({
      sourceMap: true,
      uglifyOptions: {
        mangle: false
      }
    })
  );
  module.exports.plugins.push(
    new webpack.DefinePlugin({"process.env.NODE_ENV": JSON.stringify("production")})
  );
  module.exports.plugins.push(
    new webpack.optimize.ModuleConcatenationPlugin()
  );
  module.exports.plugins.push(
    new webpack.NoEmitOnErrorsPlugin()
  );
}
