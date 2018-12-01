const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const chalk = require('chalk');

// Development builds of React are slow and not intended for production.
console.log('NODE_ENV: ', chalk.yellow(process.env.NODE_ENV));

const shouldUseSourceMap = true;

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
	const loaders = [
		require.resolve('style-loader'),
		{
			loader: require.resolve('css-loader'),
			options: cssOptions,
		},
		{
			// Options for PostCSS as we reference these options twice
			// Adds vendor prefixing based on your specified browser support in
			// package.json
			loader: require.resolve('postcss-loader'),
			options: {
				// Necessary for external CSS imports to work
				// https://github.com/facebook/create-react-app/issues/2677
				ident: 'postcss',
				plugins: () => [
					require('postcss-flexbugs-fixes'),
					require('postcss-preset-env')({
						autoprefixer: {
							flexbox: 'no-2009',
						},
						stage: 3,
					}),
				],
			},
		},
	];
	if (preProcessor) {
		loaders.push(require.resolve(preProcessor));
	}
	return loaders;
};

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
	mode: 'development',
	// Don't attempt to continue if there are any errors.
	bail: true,
	// We generate sourcemaps in production. This is slow but gives good results.
	// You can exclude the *.map files from the build during deployment.
	devtool: 'cheap-module-source-map',
	// In production, we only want to load the app code.
	entry: [
		require.resolve('core-js'),
		require.resolve('url-polyfill'),
		require.resolve('unorm'),

		'react', // Include this to enforce order
		'react-dom', // Include this to enforce order

		'./src/index.js'
	],
	output: {
		pathinfo: true,
		// The build folder.
		path: path.resolve(__dirname, 'build'),
		// [name].[hash:8].[ext]&outputPath=media/
		filename: 'static/js/[name].[hash:8].js',
		publicPath: '',
		// Point sourcemap entries to original disk location (format as URL on Windows)
		devtoolModuleFilenameTemplate: info =>
			path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
	},
	optimization: {
		// Automatically split vendor and commons
		// https://twitter.com/wSokra/status/969633336732905474
		// https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
		splitChunks: {
			chunks: 'all',
			name: false,
		},
		// Keep the runtime chunk seperated to enable long term caching
		// https://twitter.com/wSokra/status/969679223278505985
		runtimeChunk: true,
	},
	module: {
		strictExportPresence: true,
		rules: [
			// Disable require.ensure as it's not a standard language feature.
			{ parser: { requireEnsure: false } },

			// First, run the linter.
			// It's important to do this before Babel processes the JS.
			{
				test: /\.(js|mjs|jsx)$/,
				enforce: 'pre',
				use: [
					{
						options: {
							formatter: require.resolve('react-dev-utils/eslintFormatter'),
							eslintPath: require.resolve('eslint')
						},
						loader: require.resolve('eslint-loader')
					}
				],
				include: path.resolve(__dirname, 'src')
			},
			{
				// "oneOf" will traverse all following loaders until one will
				// match the requirements. When no loader matches it will fall
				// back to the "file" loader at the end of the loader list.
				oneOf: [
					// "url" loader works just like "file" loader but it also embeds
					// assets smaller than specified size as data URLs to avoid requests.
					{
						test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
						loader: require.resolve('url-loader'),
						options: {
							limit: 10000,
							name: 'static/media/[name].[hash:8].[ext]'
						}
					},
					// Process application JS with Babel.
					// The preset includes JSX, Flow, TypeScript and some ESnext features.
					{
						test: /\.(js|mjs|jsx|ts|tsx)$/,
						include: path.resolve(__dirname, 'src'),

						loader: require.resolve('babel-loader'),
						options: {
							customize: require.resolve('babel-preset-react-app/webpack-overrides'),

							plugins: [
								'react-hot-loader/babel',
								[
									require.resolve('babel-plugin-named-asset-import'),
									{
										loaderMap: {
											svg: {
												ReactComponent: '@svgr/webpack?-prettier,-svgo![path]'
											}
										}
									}
								]
							],
							cacheDirectory: true,
							// Save disk space when time isn't as important
							cacheCompression: false
						}
					},
					// Process any JS outside of the app with Babel.
					// Unlike the application JS, we only compile the standard ES features.
					{
						test: /\.(js|mjs)$/,
						exclude: /@babel(?:\/|\\{1,2})runtime/,
						loader: require.resolve('babel-loader'),
						options: {
							babelrc: false,
							configFile: false,
							compact: false,
							presets: [[require.resolve('babel-preset-react-app/dependencies'), { helpers: true }]],
							cacheDirectory: true,
							// Save disk space when time isn't as important
							cacheCompression: true,

							// If an error happens in a package, it's possible to be
							// because it was compiled. Thus, we don't want the browser
							// debugger to show the original code. Instead, the code
							// being evaluated would be much more helpful.
							sourceMaps: false
						}
					},
					// "postcss" loader applies autoprefixer to our CSS.
					// "css" loader resolves paths in CSS and adds assets as dependencies.
					// `MiniCSSExtractPlugin` extracts styles into CSS
					// files. If you use code splitting, async bundles will have their own separate CSS chunk file.
					// By default we support CSS Modules with the extension .module.css
					{
						test: /\.css$/,
						exclude: /\.module\.css$/,
						loader: getStyleLoaders({
							importLoaders: 1,
							sourceMap: shouldUseSourceMap
						}),
					},
					// Adds support for CSS Modules (https://github.com/css-modules/css-modules)
					// using the extension .module.css
					{
						test: /\.module\.css$/,
						loader: getStyleLoaders({
							importLoaders: 1,
							sourceMap: shouldUseSourceMap,
							modules: true,
							getLocalIdent: getCSSModuleLocalIdent
						})
					},
					// Opt-in support for SASS. The logic here is somewhat similar
					// as in the CSS routine, except that "sass-loader" runs first
					// to compile SASS files into CSS.
					// By default we support SASS Modules with the
					// extensions .module.scss or .module.sass
					{
						test: /\.(scss|sass)$/,
						exclude: /\.module\.(scss|sass)$/,
						loader: getStyleLoaders(
							{
								importLoaders: 2,
								sourceMap: shouldUseSourceMap
							},
							'sass-loader'
						)
					},
					// Adds support for CSS Modules, but using SASS
					// using the extension .module.scss or .module.sass
					{
						test: /\.module\.(scss|sass)$/,
						loader: getStyleLoaders(
							{
								importLoaders: 2,
								sourceMap: shouldUseSourceMap,
								modules: true,
								getLocalIdent: getCSSModuleLocalIdent
							},
							'sass-loader'
						)
					},
					// "file" loader makes sure assets end up in the `build` folder.
					// When you `import` an asset, you get its filename.
					// This loader doesn't use a "test" so it will catch all modules
					// that fall through the other loaders.
					{
						loader: require.resolve('file-loader'),
						// Exclude `js` files to keep "css" loader working as it injects
						// it's runtime that would otherwise be processed through "file" loader.
						// Also exclude `html` and `json` extensions so they get processed
						// by webpacks internal loaders.
						exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
						options: {
							name: 'static/media/[name].[hash:8].[ext]'
						}
					}
					// ** STOP ** Are you adding a new loader?
					// Make sure to add the new loader(s) before the "file" loader.
				]
			}
		]
	},
	plugins: [
		// Generates an `index.html` file with the <script> injected.
		new HtmlWebpackPlugin({
			inject: true,
			template: 'src/index.html',
		}),
		new ModuleNotFoundPlugin('.'),
		// Generate a manifest file which contains a mapping of all asset filenames
		// to their corresponding output file so that tools can pick it up without
		// having to parse `index.html`.
		new ManifestPlugin({
			fileName: 'asset-manifest.json',
			publicPath: ''
		})
		// Moment.js is an extremely popular library that bundles large locale files
		// by default due to how Webpack interprets its code. This is a practical
		// solution that requires the user to opt into importing specific locales.
		// https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
		// You can remove this if you don't use Moment.js:
		//new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	].filter(Boolean),
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		net: 'empty',
		dgram: 'empty',
		fs: 'empty',
		tls: 'empty',
		child_process: 'empty'
	},
	// Turn off performance processing because we utilize
	// our own hints via the FileSizeReporter
	performance: false
};
