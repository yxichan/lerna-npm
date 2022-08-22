module.exports = {
  presets: [
    '@babel/typescript',
    // '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['ie >= 11']
        },
        // exclude: ['transform-async-to-generator', 'transform-regenerator'],
        modules: false // 不用转化esm
        // loose: true // 不启用松散模式
      }
    ]
  ]
}
