const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
    stream: require.resolve('./shims/empty.js'),
    events: require.resolve('./shims/empty.js'),
    ws: require.resolve('./shims/empty.js'),
    http: require.resolve('./shims/empty.js'),     // ✅ NEW
    https: require.resolve('./shims/empty.js'),    // ✅ optional
    net: require.resolve('./shims/empty.js'),      // ✅ optional
    tls: require.resolve('./shims/empty.js'),      // ✅ optional
    zlib: require.resolve('./shims/empty.js'),     // ✅ optional
    crypto: require.resolve('./shims/empty.js'), // ✅ NEW
    url: require.resolve('./shims/empty.js'), // ✅ NEW
};

module.exports = config;