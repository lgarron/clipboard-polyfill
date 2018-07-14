var BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
var path = require("path");
var webpack = require("webpack");
var WebpackNotifierPlugin = require("webpack-notifier");

var PROD = JSON.parse(process.env.PROD || false);
var BUNDLE_ANALYZER = JSON.parse(process.env.BUNDLE_ANALYZER || false);

module.exports = {
   entry: {
     "clipboard-polyfill": "./clipboard-polyfill.ts",
     "clipboard-polyfill.promise": ["es6-promise/dist/es6-promise.auto.js", "./clipboard-polyfill.ts"]
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
    libraryTarget: "umd"
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
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({sourceMap: false}));
} else {
  module.exports.devtool = "source-map";
}
