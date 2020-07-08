require('@babel/polyfill');
require('@babel/register')({
  ignore: [/\/(build|node_modules)\//],
  root: './server',
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread'
  ]
});

require('./download.esm');
