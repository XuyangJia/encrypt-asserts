const program = require('commander')
const { encryptAsserts, decryptAsserts } = require('./src/assertsHandler')
program
  .version('1.0.0')
  .description('Encrypt and decrypt asserts.')
  .option('-e, --encrypt', '加密资源。')
  .option('-d, --decrypt', '解密资源')
  // .option('-s, --template-engine [engine]', 'Add template [engine] support', 'jade')
  .on('--help', function () {
    console.log('\nExamples:')
    console.log('  $ node index.js -e')
    console.log('  $ node index.js -d')
  })
  .parse(process.argv)

program.encrypt && encryptAsserts()
program.decrypt && decryptAsserts()
