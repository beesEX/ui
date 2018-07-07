/**
 * @author son87.lengoc@gmail.com
 * Created by Ngoc Son Le.
 */
const path = require('path');

module.exports = {

  mode: 'development',

  entry: {

    market: './views/market/index.jsx'

  },

  output: {

    filename: '[name].js',

    path: path.resolve(__dirname, './public/js/market')

  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [ '.js', '.json', '.jsx' ]

  },

  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            plugins: ['@babel/plugin-proposal-class-properties']
          }
        }
      },
    ]
  },

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {

    react: 'React',

    'react-dom': 'ReactDOM'

  }
};
