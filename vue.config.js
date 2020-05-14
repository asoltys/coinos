process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = !['development', 'test'].includes(process.env.NODE_ENV);

module.exports = IS_PRODUCTION
  ? {
      pluginOptions: {
        webpackBundleAnalyzer: {
          openAnalyzer: false,
        },
      },
    }
  : {
      pluginOptions: {
        webpackBundleAnalyzer: {
          analyzerMode: "disabled",
        },
      },
      runtimeCompiler: true,
      devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        proxy: {
          '/api': {
            target: 'http://localhost:3119',
            pathRewrite: { '^/api': '' },
            secure: false,
          },
          '/ws': {
            target: 'http://localhost:3119',
            pathRewrite: { '^/ws': '' },
            ws: true,
          },
        },
      },
    };
