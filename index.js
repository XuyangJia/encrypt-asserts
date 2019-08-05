const program = require('commander')
const { encryptFiles, decryptFiles, zip } = require('./src/encryptHelper')
program
  .version('1.0.0')
  .description('Encrypt and decrypt asserts.')
  .option('-e, --encrypt', '加密资源')
  .option('-d, --decrypt', '解密资源')
  .option('-z, --zip', '压缩加密目录')
  // .option('-s, --template-engine [engine]', 'Add template [engine] support', 'jade')
  .on('--help', function () {
    console.log('\nExamples:')
    console.log('  $ npm start')
    console.log('  $ node index.js -d')
  })
  .parse(process.argv)

process.argv.length === 2 && encryptFiles() // 默认不传参数 则进行加密
program.encrypt && encryptFiles()
program.decrypt && decryptFiles()

if (program.encrypt || program.zip) {
  zip()
}
