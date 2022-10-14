const HTMLWebpackPlugin = require("html-webpack-plugin");


module.exports = {
	entry: {
		style: "./game/style.js",
		main: "./game/main.js"
	},
	mode: "production",
	module: {
		rules: [
			{
				test: /\.js$/i,
				exclude: /node_modules/,
				use: "babel-loader"
			},
			{
				test: /\.(png|mp3)$/i,
				use: "file-loader"
			},
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.ttf$/i,
				type: "asset/resource"
			}
		]
	},
	plugins: [
		new HTMLWebpackPlugin({title: "LD50"})
	],
	output: {
		filename: "[name].bundle.js"
	}
};