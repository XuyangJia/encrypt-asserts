// const { encryptSingleFile } = require('../src/encryptHelper')
const fse = require('fs-extra')

// const source = './test/a.png'
// encryptSingleFile(source, './test/b.png')

const nameLib = fse.readFileSync(require('path').resolve(__dirname, '../nameLib.txt')).toString().split(' ')
console.log(nameLib)
// require('../lib/shuffle')(nameLib)
