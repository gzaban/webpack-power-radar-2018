const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');
const PACKAGE  = require('./package.json');

//onsole.log(PACKAGE);

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

//list of package you what to put in the vendor.js file - for code splitting.
const VENDORS_LIBS = ['react', 'react-dom'];

const config = {
    entry: {
        //the key is the name of the file AKA main.js.
        main:[
            'react-hot-loader/patch',
            // activate HMR for React

            'webpack-dev-server/client?http://localhost:3000',
            // bundle the client for webpack-dev-server
            // and connect to the provided endpoint

            'webpack/hot/only-dev-server',
            // bundle the client for hot reloading
            // only- means to only hot reload for successful updates

            './src/index.js'
            // the entry point of our app
        ],
        //the key is the name of the file AKA vendor.js.
        vendor: VENDORS_LIBS
    },
    output: {
        //the resolve for the path for the output. this will make a folder in the name "build" and add all the genreate file AKA fonts, images, main.js etc'
        path: path.resolve(__dirname, 'build'),
        //the file name the name is the KEY of the object in the entry. and i add the version form the package.json.
        filename: '[name].'+ PACKAGE.version +'.js',
        //the relative path for all the file
        publicPath: '/'
    },
    //the type off the source-map - can be source-map (external file *.js.map) or inline-source-map (inline source map put all the maping inside the main.js) - for all the options go to https://webpack.js.org/configuration/devtool/
    devtool: "source-map",
    //for the webpack dev server - npm start
    devServer: {
        hot: true, // Tell the dev-server we're using HMR this set the "react-hot-Loader"
        host: 'localhost',
        compress: true,
        port: 3000,
        historyApiFallback: true, // respond to 404s with index.html
        /* set all the call for the api with the origin of the "target" key
        proxy: {
            "/": {
                target: "http://frontend.dev.panpwrws.com/",
                // if the you have secure HTTPS
                secure: false
            }
        }
        */
    },
    // all the loader are in the rules of the module
    module: {
        rules: [
            // take all the js file and run them with babel - babel config is in the file ".babelrc"
            {
                use: 'babel-loader',
                exclude: /node_modules/,
                test: /\.js$/
            },
            //if you need only css.
            /*
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            */

            //take all the scss file and combined them to main.css file. all the file go in the post-css after the combined
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    // use style-loader in development
                    fallback: "style-loader",
                    use: [{
                        loader: "css-loader",
                        options: {sourceMap: true,  importLoaders: 1 }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            plugins: (loader) => [
                                require('postcss-import')({ root: loader.resourcePath }),
                                require('postcss-cssnext')(),
                                //require('autoprefixer')(), // postcss-cssnext have the autoprefixer in him.
                                require('cssnano')()
                            ]
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {sourceMap: true}
                    }]
                })
            },
            //put all the fonts file in the build directory and into fonts directory and fix all the path in the css.
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader?name=[name].[ext]&outputPath=fonts/'
                ]
            },
            //put all the fonts file in the build directory and into images directory
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader?name=[name].[ext]&outputPath=images/'
                ]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(), // Enable HMR
        // enable HMR globally

        new webpack.NamedModulesPlugin(),
        // prints more readable module names in the browser console on HMR updates

        new webpack.NoEmitOnErrorsPlugin(),
        // do not emit compiled assets that include errors
        extractSass,
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        //uglify all the js file.
        new UglifyJSPlugin()
    ]
};

module.exports = config;