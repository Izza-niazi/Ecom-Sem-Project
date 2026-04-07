const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
    app.use(
        '/uploads',
        createProxyMiddleware({
            target: 'http://localhost:4000',
            changeOrigin: true,
        })
    );
};
