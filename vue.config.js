const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.vue', '.json']
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin()
    ]
  }
}
