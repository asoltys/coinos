process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = !['development', 'test'].includes(process.env.NODE_ENV);

module.exports = IS_PRODUCTION
  ? {
    configureWebpack: {
      resolve: { aliasFields: ['browser', 'browser.esm'] }
    },
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
    configureWebpack: {
      resolve: { aliasFields: ['browser', 'browser.esm'] }
    },
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
            target: 'http://electrsb:3095',
            pathRewrite: { '^/api/electrs': '' },
            secure: false,
          },
          '/lnurl': {
            target: 'http://app:3118',
            secure: false,
          },
          '/api': {
            target: 'http://app:3119',
            pathRewrite: { '^/api': '' },
            secure: false,
          },
          '/ws': {
            target: 'http://app:3119',
            ws: true,
          },
        },
      },
    };
