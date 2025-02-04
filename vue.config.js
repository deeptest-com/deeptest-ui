/* eslint-disable @typescript-eslint/no-var-requires */
const bodyParser = require('body-parser')
const mockServer = require('./src/utils/mock/server');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

let { NODE_ENV, VUE_APP_PORT, VUE_APP_MOCK, APP_CONF, VUE_APP_DEPLOY_ENV } = process.env

// loa app conf if needed
if (APP_CONF) { // if (NODE_ENV === 'production' && APP_CONF) {
    const prodConf = require(`./.app.${APP_CONF}`)

    process.env.VUE_APP_API_SERVER = prodConf.VUE_APP_API_SERVER
    process.env.VUE_APP_API_AGENT = prodConf.VUE_APP_API_AGENT
}
console.log('API URLs: ', process.env.VUE_APP_API_SERVER, process.env.VUE_APP_API_AGENT)
console.log('Deploy Env: ', process.env.VUE_APP_DEPLOY_ENV)

module.exports = {
    publicPath: VUE_APP_DEPLOY_ENV === 'ly-saas' ? '/lya' : '/',
    outputDir: 'dist',
    productionSourceMap: false,
    devServer: {
        port: VUE_APP_PORT || 8000,
        disableHostCheck: true,
        https:false,
        headers: { "Access-Control-Allow-Origin": "*" },
        before: function(app, server) {
            if(NODE_ENV === 'development' && VUE_APP_MOCK === 'true') {
                // parse app.body
                // https://expressjs.com/en/4x/api.html#req.body
                // create application/json parser
                app.use(bodyParser.json());
                // create application/x-www-form-urlencoded parser
                app.use(bodyParser.urlencoded({ extended: false}));
                mockServer(app);
            }
        }
    },
    css: {
        loaderOptions: {
            less: {
                javascriptEnabled: true,
            }
        }
    },
    // 修改webpack的配置
    configureWebpack: {

    },
    chainWebpack(config) {
        // 内置的 svg Rule 添加 exclude
        config.module
            .rule('svg')
            .exclude.add(/iconsvg/)
            .end();

        // 添加 svg-sprite-loader Rule
        config.module
            .rule('svg-sprite-loader')
            .test(/.svg$/)
            .include.add(/iconsvg/)
            .end()
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader');

        // 添加 svgo Rule
        config.module
            .rule('svgo')
            .test(/.svg$/)
            .include.add(/iconsvg/)
            .end()
            .use('svgo-loader')
            .loader('svgo-loader')
            .options({
                // externalConfig 配置特殊不是相对路径，起始路径是根目录
                externalConfig: './src/assets/iconsvg/svgo.yml',
            });

        config.resolve.alias.set('vue-i18n', 'vue-i18n/dist/vue-i18n.cjs.js')

        config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
            {
                languages: [
                    'javascript',
                    'typescript',
                    'html',
                    'xml',
                    'json',
                    'plaintext',
                ]
            }
        ])
    }
}
