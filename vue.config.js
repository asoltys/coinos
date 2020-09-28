process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = !['development', 'test'].includes(process.env.NODE_ENV);

module.exports = IS_PRODUCTION
  ? {
      pluginOptions: {
        webpackBundleAnalyzer: {
          openAnalyzer: false,
        },
      },
      chainWebpack: config => {
        config.module
          .rule('vue')
          .use('vue-loader')
          .loader('vue-loader')
          .tap(options => {
            // modify the options...
            options.compilerOptions.whitespace = 'preserve';
            return options;
          });
      },
    }
  : {
      pluginOptions: {
        webpackBundleAnalyzer: {
          analyzerMode: 'disabled',
        },
      },
      runtimeCompiler: true,
      chainWebpack: config => {
        config.module
          .rule('vue')
          .use('vue-loader')
          .loader('vue-loader')
          .tap(options => {
            // modify the options...
            options.compilerOptions.whitespace = 'preserve';
            return options;
          });
      },
      devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        proxy: {
          '/api/electrs': {
            target: 'http://localhost:3001',
            pathRewrite: { '^/api/electrs': '' },
            secure: false,
          },
          '/lnurl': {
            target: 'http://localhost:3118',
            secure: false,
          },
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
