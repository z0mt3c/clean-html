const path = require('path');

 module.exports = {
   entry: './index.js',
   mode: 'production',
   output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'clean-html.js',
    library: {
      name: 'clean-html',
      type: 'umd'
    }
   }
 }