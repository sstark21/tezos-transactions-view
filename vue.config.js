module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
    ? '/tezos-transactions-view/'
    : '/',

    transpileDependencies: [
      'vuetify'
    ]
}
