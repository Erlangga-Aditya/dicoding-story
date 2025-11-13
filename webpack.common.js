const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Membersihkan folder dist sebelum build baru
  },
  module: {
    rules: [
      // 1. RULE JAVASCRIPT (BABEL)
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
      // 2. RULE KRITIS UNTUK CSS (Urutan: BAWAH ke ATAS)
      {
        test: /\.css$/,
        use: [
          // PROSES KEDUA: style-loader (Menyuntikkan ke DOM)
          {
            loader: 'style-loader',
          },
          // PROSES PERTAMA: css-loader (Membaca file CSS)
          {
            loader: 'css-loader',
          },
        ],
      },
      // 3. RULE UNTUK GAMBAR
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
        },
        {
          from: path.resolve(__dirname, 'src/public/icons/'),
          to: path.resolve(__dirname, 'dist/public/icons/'),
          noErrorOnMissing: true
        },
        {
          from: path.resolve(__dirname, 'src/manifest.json'),
          to: path.resolve(__dirname, 'dist/manifest.json'),
        },
        {
          from: path.resolve(__dirname, 'src/service-worker.js'),
          to: path.resolve(__dirname, 'dist/service-worker.js'),
        },
      ],
    }),
  ],
};