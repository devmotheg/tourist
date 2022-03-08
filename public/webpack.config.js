/*!
 * @author Mohamed Muntasir
 * @link https://github.com/devmotheg
 */

const path = require("path");

module.exports = {
  entry: {
    index: path.resolve(__dirname, "src/ts/index.ts"),
  },
  devtool: false,
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: ["ts-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "static/dist"),
    clean: true,
  },
  watch: true,
  watchOptions: {
    ignored: /node_modules/,
    poll: 200,
    aggregateTimeout: 200,
  },
};
