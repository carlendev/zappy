const nodeExternals = require("webpack-node-externals");
const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

module.exports = {
  target: "node",
  externals: [nodeExternals()],
  entry: {
    index: "./server/index.js"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js",
    libraryTarget: "commonjs2"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["es2015"]
          }
        }
      }
    ]
  },
  plugins: [new UglifyJSPlugin()]
};
