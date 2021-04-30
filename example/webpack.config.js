const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackPluginServe } = require("webpack-plugin-serve");

const outputPath = path.join(__dirname, "build");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: [path.join(__dirname, "App.tsx"), "webpack-plugin-serve/client"],
  output: {
    path: outputPath,
    filename: "bundle.js",
    publicPath: "/",
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: "ts-loader" },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "index.html"),
    }),
    new WebpackPluginServe({
      hmr: false,
      progress: false,
      status: false,
      port: 8080,
      static: [outputPath],
    }),
  ],
  watch: true,
};
