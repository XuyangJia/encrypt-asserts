const crypto = require('crypto')

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

module.exports = {
  aesEncrypt,
  aesDecrypt
}
