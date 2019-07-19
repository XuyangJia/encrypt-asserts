const path = require('path')
const fse = require('fs-extra')
const { encryptFile, decryptFile, aesEncrypt } = require('../lib/cryptoUtils')
const shuffle = require('../lib/shuffle')
const { algorithm, encryptKey, iv, inputDir, outputDir, decryptDir, namesFile, nameLib1, nameLib2, confusionRatio, renameIgnore } = fse.readJSONSync('./encrypt_cfg.json')
const sourceDir = path.resolve(inputDir)
const encryptedDir = path.resolve(outputDir)
const versionFileName = 'version.json'
const fakePngExt = '.zzz'
let suffix = Date.now()
let encryptNames = []

/**
 * 根据扩展名获取新的文件名
 * @param {String} ext 扩展名
 * @return {String} 新的文件名
 */
function getRandName (ext) {
  suffix += 10 ** 10 // 修改后缀
  const rand1 = Math.floor(Math.random() * nameLib1.length)
  const rand2 = Math.floor(Math.random() * nameLib2.length)
  return `${nameLib1[rand1]}_${nameLib2[rand2]}_${suffix.toString(36)}${ext}`
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
    const encrypted = encryptFile(src, algorithm, encryptKey, iv)
    console.log(`插入混淆文件 => ${newName}`)
    fse.outputFileSync(dest, encrypted)
  })
}

/**
 * 加密资源
 */
function encryptAsserts () {
  const versionObj = fse.readJSONSync(path.resolve(sourceDir, versionFileName))
  fse.emptyDirSync(encryptedDir)
  Object.keys(versionObj).forEach(key => {
    const src = path.resolve(sourceDir, versionObj[key])
    if (fse.existsSync(src)) { // 检测文件是否存在
      const base = path.basename(src)
      const ext = path.extname(src)
      let newName = getRandName(ext === '.png' ? fakePngExt : ext)
      renameIgnore.includes(ext) && (newName = base)
      const dest = path.resolve(encryptedDir, newName)
      const encrypted = encryptFile(src, algorithm, encryptKey, iv)
      fse.outputFileSync(dest, encrypted)
      encryptNames.push(newName)
      console.log(`${base} => ${newName}`)

      const newPath = dest.slice(encryptedDir.length + 1)
      versionObj[key] = newPath.split('.')[0] + ext
    }
  })

  const versionName = getRandName('.json')
  encryptNames.unshift(versionName)
  fse.outputFileSync(path.resolve(encryptedDir, versionName), aesEncrypt(JSON.stringify(versionObj), algorithm, encryptKey, iv))
  fse.outputFileSync(path.resolve(encryptedDir, namesFile), aesEncrypt(JSON.stringify(encryptNames), algorithm, encryptKey, iv))

  insertConfusionFiles(encryptNames)
}

/**
 * 解密还原
 */
function decryptAsserts () {
  fse.emptyDirSync(decryptDir)
  encryptNames = JSON.parse(decryptFile(path.resolve(encryptedDir, namesFile), algorithm, encryptKey, iv).toString())
  encryptNames.forEach(name => {
    const ext = path.extname(name)
    const src = path.resolve(encryptedDir, name)
    const dest = path.resolve(decryptDir, ext === fakePngExt ? (path.basename(name, ext) + '.png') : name)
    console.log(`还原文件 => ${name}`)
    const decrypted = decryptFile(src, algorithm, encryptKey, iv)
    fse.outputFileSync(dest, decrypted)
  })
  const versionFP = path.resolve(decryptDir, versionFileName)
  fse.renameSync(path.resolve(decryptDir, encryptNames[0]), versionFP)
}

/**
 * 加密单个文件
 * @param {String} oldPath 待加密文件位置
 * @param {String} newPath 加密后文件位置
 */
function encryptSingleFile (oldPath, newPath) {
  const encrypted = encryptFile(oldPath, algorithm, encryptKey, iv)
  fse.outputFileSync(newPath, encrypted)
}

module.exports = {
  encryptAsserts,
  decryptAsserts,
  encryptSingleFile
}
