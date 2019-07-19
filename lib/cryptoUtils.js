const crypto = require('crypto')
const fse = require('fs-extra')

/**
 * aes加密
 * @param data 待加密数据
 * @param algorithm 加密算法
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {*}
 */
function aesEncrypt (data, algorithm, secretKey, iv) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const encrypted = cipher.update(data)
  const final = cipher.final()
  return Buffer.concat([encrypted, final])
}

/**
 * aes解密
 * @param data 待解密数据
 * @param algorithm 加密算法
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {*}
 */
function aesDecrypt (data, algorithm, secretKey, iv) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv)
  const decrypted = decipher.update(data)
  const final = decipher.final()
  return Buffer.concat([decrypted, final])
}

/**
 * 加密文件
 * @param fp 待加密文件路径
 * @param algorithm 加密算法
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {*}
 */
function encryptFile (fp, algorithm, secretKey, iv) {
  const sourceData = fse.readFileSync(fp)
  return aesEncrypt(sourceData, algorithm, secretKey, iv)
}

/**
 * 解密文件
 * @param fp 待解密文件路径
 * @param algorithm 加密算法
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {*}
 */
function decryptFile (fp, algorithm, secretKey, iv) {
  const encryptedData = fse.readFileSync(fp)
  return aesDecrypt(encryptedData, algorithm, secretKey, iv)
}

module.exports = {
  aesEncrypt,
  aesDecrypt,
  encryptFile,
  decryptFile
}
