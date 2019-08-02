require('colors')
const path = require('path')
const fse = require('fs-extra')
const compressing = require('compressing')
const { aesEncrypt, aesDecrypt } = require('../lib/cryptoUtils')
const shuffle = require('../lib/shuffle')
const { algorithm, encryptKey, iv, inputDir, outputDir, decryptDir, namesFile, confusionRatio, encryptIgnore, renameIgnore, versionFile, dirMap } = fse.readJSONSync('./encrypt_cfg.json')
const sourceDir = path.resolve(inputDir)
const encryptedDir = path.resolve(outputDir)
let suffix = Date.now()
let encryptNames = []
let dirObj = {}

// 加密数据
const encrypter = data => aesEncrypt(data, algorithm, encryptKey, iv)
// 解密数据
const decrypter = data => aesDecrypt(data, algorithm, encryptKey, iv)
// 加密文件
const encryptFile = fp => encrypter(fse.readFileSync(fp))
// 解密文件
const decryptFile = fp => decrypter(fse.readFileSync(fp))

const nameLib = fse.readFileSync(path.resolve(__dirname, '../nameLib.txt')).toString().split(' ')

// 转换映射表
for (const key in dirMap) {
  const types = dirMap[key]
  types.forEach(type => {
    dirObj[type] = key
  })
}

/**
 * 根据扩展名获取新的文件名
 * @param {String} ext 扩展名
 * @return {String} 新的文件名
 */
function getRandName (ext) {
  suffix += 10 ** 10 // 修改后缀
  const dir = dirObj[ext] ? dirObj[ext] : 'other'
  const rand = Math.floor(Math.random() * nameLib.length)
  const name = `${nameLib[rand]}_${suffix.toString(36)}${ext}`
  return path.join(dir, name)
}

/**
 * 插入混淆文件
 * @param {Array} names 插入混淆文件的参考文件
 */
function insertConfusionFiles (names) {
  names = shuffle(names).slice(0, Math.floor(names.length * confusionRatio))
  names.forEach(name => {
    const src = path.resolve(encryptedDir, name)
    const newName = getRandName(path.extname(src))
    const dest = path.resolve(encryptedDir, newName)
    const encrypted = encryptFile(src)
    console.log(`插入混淆文件 => ${newName}`.random)
    fse.outputFileSync(dest, encrypted)
  })
}

/**
 * 加密资源
 */
function encryptFiles () {
  const versionObj = fse.readJSONSync(path.resolve(sourceDir, versionFile))
  fse.emptyDirSync(encryptedDir)
  Object.keys(versionObj).forEach(key => {
    const src = path.resolve(sourceDir, versionObj[key])
    if (fse.existsSync(src)) { // 检测文件是否存在
      const base = path.basename(src)
      const ext = path.extname(src)
      let newName = getRandName(ext)
      renameIgnore.includes(ext) && (newName = base)
      const dest = path.resolve(encryptedDir, newName)
      if (encryptIgnore.includes(base)) {
        fse.copyFileSync(src, dest)
      } else {
        const encrypted = encryptFile(src)
        fse.outputFileSync(dest, encrypted)
        encryptNames.push(newName)
        console.log(`正在加密 ${base} => ${newName}`.green)
      }

      const newPath = dest.slice(encryptedDir.length + 1)
      versionObj[key] = newPath.split('.')[0] + ext
    }
  })

  const versionName = versionFile
  fse.outputFileSync(path.resolve(encryptedDir, versionName), encrypter(JSON.stringify(versionObj)))
  fse.outputFileSync(path.resolve(encryptedDir, namesFile), encrypter(JSON.stringify(encryptNames)))

  insertConfusionFiles(encryptNames)
}

/**
 * 解密还原
 */
function decryptFiles () {
  fse.emptyDirSync(decryptDir)
  encryptNames = JSON.parse(decryptFile(path.resolve(encryptedDir, namesFile)).toString())
  encryptNames.forEach(name => {
    const src = path.resolve(encryptedDir, name)
    const dest = path.resolve(decryptDir, name)
    console.log(`还原文件 ${name} => ${dest}`.underline.cyan)
    const decrypted = decryptFile(src)
    fse.outputFileSync(dest, decrypted)
  })
  fse.outputFileSync(path.resolve(decryptDir, versionFile), decryptFile(path.resolve(encryptedDir, versionFile)))
  fse.copyFileSync(path.resolve(encryptedDir, 'index.html'), path.resolve(decryptDir, 'index.html'))
}

function zip () {
  console.log('\n>>> 开始压缩 <<<'.yellow)
  compressing.zip.compressDir(encryptedDir, `${outputDir}.zip`)
    .then(() => {
      console.log('压缩成功'.rainbow)
    })
    .catch(err => {
      console.error(err)
    })
}

/**
 * 加密单个文件
 * @param {String} oldPath 待加密文件位置
 * @param {String} newPath 加密后文件位置
 */
function encryptSingleFile (oldPath, newPath) {
  const encrypted = encryptFile(oldPath)
  fse.outputFileSync(newPath, encrypted)
}

module.exports = {
  encryptFiles,
  decryptFiles,
  zip,
  encryptSingleFile
}
