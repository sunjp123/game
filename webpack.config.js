'use strict';

const path = require('path');
const args = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = {
  devtool: 'inline-source-map',
  mode: args.env, 
	watch:args.env=='production'?false:true,
	watchOptions: {
		aggregateTimeout: 300,
		poll: 1000,
		ignored: /(node_modules|dist)/
	},
  entry: {
		main:path.resolve(__dirname, "./static/index.js") // string | object | array
	},
  output: {
    // webpack 如何输出结果的相关选项
		path: path.resolve(__dirname, "./static/dist"), // string
		publicPath:'/dist/',
    filename: "[name].js", // 用于多个入口点(entry point)（出口点？）
	},
	resolve: {
    // 用于查找模块的目录
    extensions: [".js", ".json", ".jsx", ".css"],
  },
  module: {
    // 关于模块配置

    rules: [
      // 模块规则（配置 loader、解析器等选项）

	{
		test: /\.jsx?$/,
		include: [
		  path.resolve(__dirname, "./static")
		],
		exclude: /(node_modules)/,
		use:[
			{
				loader: 'babel-loader',
				options: {
				  presets: ["env","stage-2","react"],
				  cacheDirectory: true
				}
			}
		]


	},
	{
		test: /\.css$/,
		loader: 'style-loader!css-loader'
	},
	{
		test: /\.scss/,
		use: [
			'style-loader',
			{ loader: 'css-loader', options: { sourceMap: true } },
			{
				loader: 'postcss-loader',
				options:
				{
					plugins: loader => [
						autoprefixer({
							browsers: ['last 4 versions', 'not ie < 8']
						})
					]
				}
			},
			'sass-loader'
		]
	},
	{
		test: /\.styl/,
		loader: 'style-loader!css-loader!stylus-loader'
	},
	{
		test: /\.(png|jpg|gif|woff|woff2)$/,
		loader: 'url-loader?limit=8192'
	},
	{
		test: /\.(mp4|ogg|svg)$/,
		loader: 'file-loader'
	}
    ]
	},
	optimization: {
			minimize: true,
			runtimeChunk: {
					name: "manifest"
			},
			splitChunks: {
					cacheGroups: {
							// commons: {
							// 		test: /[\\/]node_modules[\\/]/,
							// 		name: "vendor",
							// 		chunks: "all"
							// },
							libs: {
								name: "chunk-vendor",
								test: /[\\/]node_modules[\\/]/,
								priority: 10,
								chunks: "initial" // 只打包初始时依赖的第三方
							}
					}
			}
	},
  plugins: [
		new webpack.LoaderOptionsPlugin({
            debug: true
        }),
        new webpack.NamedModulesPlugin(),
		new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(args.env)
				})
				//,
				//new BundleAnalyzerPlugin({analyzerMode:"static"})
	]
}