const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve.fallback = {
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        util: require.resolve('util/'),
        // Adicione outros fallbacks se necessário
    };

    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        })
    );

    return config;
};
