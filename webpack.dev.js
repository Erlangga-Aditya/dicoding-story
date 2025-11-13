const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
  // Mode Development
  mode: 'development',
  
  // Devtool untuk memudahkan debugging
  devtool: 'inline-source-map',
  
  // HAPUS BLOCK 'module' DI SINI agar tidak menduplikasi rule CSS
  // module: { rules: [] }, 
  
  // Konfigurasi Webpack Dev Server
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    historyApiFallback: true, 
    compress: true,
    port: 9000, 
  },
});