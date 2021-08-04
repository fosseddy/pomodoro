const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = function(_, argv) {
  let config =  {
    entry: path.resolve(__dirname, "src", "index.ts"),
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
      clean: true
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "src", "index.html")
      }),
      new MiniCssExtractPlugin()
    ],
    resolve: {
      extensions: [".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts?$/,
          use: "ts-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"]
        }
      ]
    },

  };

  switch (argv.mode) {
    case "development": {
      config.mode = "development";
      config.devtool = "inline-source-map";
      config.devServer = {
        contentBase: path.resolve(__dirname, "dist"),
        host: "0.0.0.0"
      };
    } break;

    case "production": {
      config.mode = "production";
    } break;

    default: throw new Error("Provide webpack mode");
  }

  return config;
};
