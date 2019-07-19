const path = require('path')
const fse = require('fs-extra')
const { encryptFile, decryptFile } = require('../lib/cryptoUtils')
const { algorithm, encryptKey, iv } = fse.readJSONSync('./encrypt_cfg.json')

const source = 'icon.png'
const encrypted = encryptFile(source, algorithm, encryptKey, iv)
const encryptedName = `${path.basename(source, path.extname(source))}2${path.extname(source)}`
fse.outputFileSync(encryptedName, encrypted)

const decrypted = decryptFile(encryptedName, algorithm, encryptKey, iv)
const decryptedName = `${path.basename(source, path.extname(source))}3${path.extname(source)}`
fse.outputFileSync(decryptedName, decrypted)
