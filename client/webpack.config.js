const path = require('path')
const outputDir = path.join(__dirname, 'build/')

const isProd = process.env.NODE_ENV === 'production'

const less_override = path.resolve(__dirname, 'less/index.less')

module.exports = {
  entry: './src/Index.bs.js',
  mode: isProd ? 'production' : 'development',
  output: {
    path: outputDir,
    filename: 'Index.js',
  },
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ['svg-inline-loader'],
      },
    ],
  },
  resolve: {
    alias: {
      '@public': path.resolve('./build/'),
    },
  },
  plugins: [],
  devServer: {
    compress: true,
    contentBase: outputDir,
    port: process.env.PORT || 8000,
    historyApiFallback: true,
  },
}
