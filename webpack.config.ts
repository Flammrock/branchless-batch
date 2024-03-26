/*********************************************************************************\
* Copyright (c) 2024 Flammrock                                                    *
*                                                                                 *
* Permission is hereby granted, free of charge, to any person obtaining a copy    *
* of this software and associated documentation files (the "Software"), to deal   *
* in the Software without restriction, including without limitation the rights    *
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell       *
* copies of the Software, and to permit persons to whom the Software is           *
* furnished to do so, subject to the following conditions:                        *
*                                                                                 *
* The above copyright notice and this permission notice shall be included in all  *
* copies or substantial portions of the Software.                                 *
*                                                                                 *
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR      *
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,        *
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE     *
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER          *
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,   *
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE   *
* SOFTWARE.                                                                       *
\*********************************************************************************/

import path from 'path'
import { Configuration } from 'webpack'
import { Configuration as DevServerConfiguration } from 'webpack-dev-server'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const isProduction = process.env.NODE_ENV == 'production'

const distPath = path.resolve(__dirname, 'dist')
const publicPath = path.resolve(__dirname, 'public')

const devServer: DevServerConfiguration = {
  static: {
    directory: distPath
  },
  port: 9000
}

const config: Configuration = {
  entry: './src/index.tsx',
  mode: 'production',
  devtool: 'source-map',
  target: ['web', 'es5'],
  output: {
    path: distPath,
    filename: 'index.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true
            }
          },
          'postcss-loader'
        ],
        include: /\.module\.css$/
      },
      {
        test: /\.css$/,
        use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader'],
        exclude: /\.module\.css$/
      },
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.json'
        },
        exclude: ['/node_modules/']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()]
  },
  devServer,
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(publicPath, 'index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: publicPath,
          to: distPath,
          globOptions: {
            ignore: ['**/index.html']
          }
        }
      ]
    }),
    autoprefixer,
    tailwindcss
  ],
  performance: {
    hints: false
  }
}

export default config
