const program = require('commander')
const { encryptAsserts, decryptAsserts } = require('./src/assertsHandler')
program
  .version('1.0.0')
  .option('-e, --encrypt', '加密资源。')
  .option('-d, --decrypt', '解密资源')
  .option('-s, --template-engine [engine]', 'Add template [engine] support', 'jade') // test
  .on('--help', function () {
    console.log('\nExamples:')
    console.log('  $ npm start -e')
    console.log('  $ npm start -d')
  })
  .parse(process.argv)

program.encrypt && encryptAsserts()
program.decrypt && decryptAsserts()
