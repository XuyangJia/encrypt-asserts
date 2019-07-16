const path = require('path')
const fse = require('fs-extra')
const { aesEncrypt, aesDecrypt } = require('./utils')
// const releaseDir = path.resolve(path.resolve('..'), 'release')
// const sourceDir = path.resolve(releaseDir, 'web66')
// const encryptedDir = path.resolve(releaseDir, 'web67')
// const excludeTypes = ['.js', '.json', '.html']

const algorithm = 'aes-128-gcm'
const encryptKey = 'vwOr2r'
const iv = '0123456789ABCDEF'

// const nameLib = ['apple', 'banana', 'strawberry', 'blueberry', 'cherry', 'chestnut', 'coconut', 'cranberry', 'durian', 'fig', 'peach', 'grape', 'lemon', 'longan', 'mango', 'melon', 'orange', 'papaya', 'pear', 'pineapple']

// const versionObj = fse.readJSONSync(path.resolve(sourceDir, 'version.json'))
// fse.emptyDirSync(encryptedDir)
// Object.keys(versionObj).forEach(key => {
//   const src = path.resolve(sourceDir, versionObj[key])
//   const rand = Math.floor(Math.random() * nameLib.length)
//   const base = path.basename(src)
//   const ext = path.extname(src)
//   const newName = excludeTypes.indexOf(ext) === -1 ? `${nameLib[rand]}_${Date.now().toString(36)}${ext}` : base
//   const dest = path.resolve(encryptedDir, newName)
//   const { data, tag } = encryptFile(src, algorithm, encryptKey, iv, authTagLength)

//   console.log(newName)
//   fse.outputFileSync(dest, data)
//   versionObj[key] = [dest.slice(encryptedDir.length + 1), tag.toString()]
// })
// fse.outputJSONSync(path.resolve(encryptedDir, 'version.json'), versionObj)

const ext = '.png'
const sourceData = fse.readFileSync(`a${ext}`)
console.log(sourceData)

const secretData = aesEncrypt(sourceData, algorithm, encryptKey, iv)
// fse.outputFileSync(`b${ext}`, secretData)
console.log(secretData)

const data2 = aesDecrypt(secretData, algorithm, encryptKey, iv)
console.log(data2)
fse.outputFileSync(`c${ext}`, data2)

// const buf = fse.readFileSync(`a${ext}`)
// fse.outputFileSync(`b${ext}`, buf)
