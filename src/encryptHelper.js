require('colors')
const path = require('path')
const fse = require('fs-extra')
const compressing = require('compressing')
const { aesEncrypt, aesDecrypt } = require('../lib/cryptoUtils')
const shuffle = require('../lib/shuffle')
const { needEncrypt, algorithm, encryptKey, iv, inputDir, outputDir, decryptDir, namesFile, confusionRatio, encryptIgnore, renameIgnore, versionFile, dirMap, minFilesNum, maxDirNum } = require('./encrypt_cfg.js')
const sourceDir = path.resolve(inputDir)
const encryptedDir = path.resolve(outputDir)
let encryptNames = []
let dirObj = {}
let dirNameObj = {}
let numberObj = {} // 重名的增加编号

// 加密数据
const encrypter = data => aesEncrypt(data, algorithm, encryptKey, iv)
// 解密数据
const decrypter = data => aesDecrypt(data, algorithm, encryptKey, iv)
// 加密文件
const encryptFile = fp => encrypter(fse.readFileSync(fp))
// 解密文件
const decryptFile = fp => decrypter(fse.readFileSync(fp))

const nameLib = shuffle(fse.readFileSync(path.resolve(__dirname, './nameLib.txt')).toString().split(' '))

// 转换映射表
for (const key in dirMap) {
  const types = dirMap[key]
  types.forEach(type => {
    dirObj[type] = key
  })
}

// 获取一级目录名
const getDirName = ext => {
  const primaryDir = dirObj[ext] ? dirObj[ext] : 'others'
  const dirNames = dirNameObj[primaryDir]
  if (Array.isArray(dirNames)) {
    return path.join(primaryDir, dirNames[Math.floor(Math.random() * dirNames.length)])
  }
  return primaryDir
}

/**
 * 根据扩展名获取新的文件名
 * @param {String} ext 扩展名
 * @return {String} 新的文件名
 */
function getRandName (ext) {
  const dir = getDirName(ext)
  const rand = Math.floor(Math.random() * nameLib.length)
  let name = path.join(dir, nameLib[rand])
  if (numberObj[name]) {
    numberObj[name] += 1
    name = `${name}_${numberObj[name]}`
  } else {
    numberObj[name] = 1
  }
  return name + ext
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
 * 生成加密文件存放目录
 * @param {*} versionObj
 */
function createDirectorys (versionObj) {
  const numCounter = {}
  Object.keys(versionObj).forEach(key => {
    const src = path.resolve(sourceDir, versionObj[key])
    if (fse.existsSync(src)) { // 检测文件是否存在
      const ext = path.extname(src)
      const dirName = getDirName(ext)
      if (numCounter[dirName]) {
        numCounter[dirName] += 1
      } else {
        numCounter[dirName] = 1
      }
    }
  })

  const maxFilesNum = Math.max(...Object.values(numCounter))
  let ratio
  if (maxFilesNum >= minFilesNum * maxDirNum) {
    ratio = maxFilesNum / Math.pow(maxDirNum, 2)
  } else {
    ratio = Math.round(maxFilesNum / minFilesNum)
  }

  for (const key in numCounter) {
    const filesNum = numCounter[key]
    if (filesNum >= minFilesNum) {
      const dirNum = Math.round(Math.sqrt(filesNum / ratio))
      if (nameLib.length >= dirNum) {
        dirNameObj[key] = nameLib.splice(0, dirNum)
      } else {
        console.warn('名字库数量不足, 请立即补充！！！'.red)
      }
    }
  }
}

/**
 * 加密资源
 */
function encryptFiles () {
  const versionObj = fse.readJSONSync(path.resolve(sourceDir, versionFile))
  fse.emptyDirSync(encryptedDir)

  // 生成目录
  createDirectorys(versionObj)

  // 加密文件
  Object.keys(versionObj).forEach(key => {
    const src = path.resolve(sourceDir, versionObj[key])
    if (fse.existsSync(src)) { // 检测文件是否存在
      const base = path.basename(src)
      const ext = path.extname(src)
      let newName = getRandName(ext)
      renameIgnore.includes(ext) && (newName = base)
      const dest = path.resolve(encryptedDir, newName)
      if (encryptIgnore.includes(base) || !needEncrypt) {
        needEncrypt || console.log(`无需加密 ${src} => ${dest}`.green)
        fse.ensureFileSync(dest)
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
  if (needEncrypt) {
    fse.outputFileSync(path.resolve(encryptedDir, versionName), encrypter(JSON.stringify(versionObj)))
    fse.outputFileSync(path.resolve(encryptedDir, namesFile), encrypter(JSON.stringify(encryptNames)))
  } else {
    fse.outputFileSync(path.resolve(encryptedDir, versionName), JSON.stringify(versionObj))
  }

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
