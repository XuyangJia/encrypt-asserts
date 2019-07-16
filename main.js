const crypto = require('crypto')
const fse = require('fs-extra')

/**
 * aes加密
 * @param data
 * @param secretKey
 */
function aesEncrypt (data, secretKey, iv) {
  var md5 = crypto.createHash('md5')
  var result = md5.update(secretKey).digest()
  var cipher = crypto.createCipheriv('aes-128-gcm', result, iv)
  const encrypted = cipher.update(data)
  const final = cipher.final()
  const tag = cipher.getAuthTag()
  const res = Buffer.concat([encrypted, final, tag]) // java的GCM加密是把AuthTag合并在一起的
  return res.toString('base64')
}

/**
 * aes解密
 * @param data
 * @param secretKey
 * @returns {*}
 */
function aesDecrypt (encrypted, secretKey, iv) {
  var md5 = crypto.createHash('md5')
  var result = md5.update(secretKey).digest()
  var decipher = crypto.createDecipheriv('aes-128-gcm', result, iv)

  var b = Buffer.from(encrypted, 'base64')
  decipher.setAuthTag(b.subarray(b.length - 16))
  return decipher.update(b.subarray(0, b.length - 16)) + decipher.final('utf8')
}

const data = fse.readFileSync('./a.txt')
const key = 'vwOr2r'
const iv = '0123456789ABCDEF'
let encryptStr = aesEncrypt(data, key, iv)
fse.outputFileSync('./b.txt', encryptStr)
console.log('------------------------------------------------')
encryptStr = fse.readFileSync('./b.txt').toString()
console.log('------------------------------------------------')
console.log(encryptStr)
let out = aesDecrypt(encryptStr, key, iv)
console.log('------------------------------------------------')
console.log(out)
