/* eslint-disable import/no-extraneous-dependencies */

import { resolve } from 'path'
import webpack from 'webpack'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin'
import WriteFilePlugin from 'write-file-webpack-plugin' // here so you can see what chunks are built
import StatsPlugin from 'stats-webpack-plugin'

const res = (p) => resolve(__dirname, p)

export default (env) => {
  const isServer = JSON.parse(env.server) || undefined
  const isClient = !isServer || undefined
  const isDev = process.env.NODE_ENV === 'development' || undefined
  const isProd = !isDev || undefined
  return {
    name: isServer ? 'server' : 'client',
    target: isServer ? 'node' : 'web',
    mode: process.env.NODE_ENV,
    devtool: 'source-map',
    entry: {
      [isServer ? 'h' : 'main']: [
        isServer && 'source-map-support/register',
        isClient &&
          isDev &&
          'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=false&quiet=false&noInfo=false',
        isClient && 'core-js/stable',
        isClient && 'regenerator-runtime/runtime',
        res(isServer ? '../src/render.server.js' : '../src/render.browser.js'),
      ].filter(Boolean),
    },
    output: {
      filename: '[name].js',
      chunkFilename: '[name].js',
      path: res(isServer ? '../buildServer' : '../buildClient'),
      publicPath: '/static/',
      libraryTarget: isServer && 'commonjs2',
    },
    module: {
      strictExportPresence: true, // If you import something that isn't exported
      rules: [
        {
          test: /\.(j|t)sx?$/,
          // Skip node_modules, with the exception of packages in the monorepo
          exclude: /[\\/]node_modules[\\/](?!@respond-framework)/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              rootMode: 'upward',
              envName: 'webpack',
            },
          },
        },
        {
          test: /\.(j|t)sx?$/,
          exclude: /[\\/]node_modules[\\/](?!@respond-framework)/,
          enforce: 'pre',
          use: {
            loader: 'eslint-loader',
            options: {
              configFile: '../../.eslintrc.js',
              ignorePath: '../../.eslintignore',
              reportUnusedDisableDirectives: true,
              cache: true,
              emitError: isProd, // Production builds must have no warnings
            },
          },
        },
        {
          test: /node_modules\/@respond-framework\//,
          enforce: 'pre',
          use: 'source-map-loader',
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            isClient && ExtractCssChunks.loader,
            {
              loader: isServer ? 'css-loader/locals' : 'css-loader',
              options: {
                modules: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          ].filter(Boolean),
        },
      ],
    },
    resolve: {
      symlinks: false,
      extensions: isServer
        ? ['.server.js', '.ts', '.tsx', '.js', '.jsx', '.css']
        : ['.browser.js', '.ts', '.tsx', '.js', '.jsx', '.css'],
      mainFields: [
        'rudy-src-main',
        isClient && 'browser',
        'module',
        'main',
      ].filter(Boolean),
    },
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          minify: (file, sourceMap) => {
            const terserOptions = {
              compress: false,
              sourceMap: sourceMap && {
                content: sourceMap,
              },
              ie8: true,
            }

            // eslint-disable-next-line global-require
            return require('terser').minify(file, terserOptions)
          },
          sourceMap: true,
        }),
      ],
      runtimeChunk: isClient && {
        name: 'bootstrap',
      },
      splitChunks: isClient && {
        chunks: 'initial',
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
          },
        },
      },
    },
    plugins: [
      isClient && new ExtractCssChunks(),
      isServer &&
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
      isClient && isDev && new webpack.HotModuleReplacementPlugin(),
      isClient && isProd && new StatsPlugin('stats.json'),
      isClient && isProd && new webpack.HashedModuleIdsPlugin(), // not needed for strategy to work (just good practice)
      new WriteFilePlugin(),
    ].filter(Boolean),
  }
}
