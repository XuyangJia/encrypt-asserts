const { encryptSingleFile } = require('../src/assertsHandler')

const source = './test/a.png'
encryptSingleFile(source, './test/b.png')
