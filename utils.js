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
  const md5 = crypto.createHash('md5')
  const result = md5.update(secretKey).digest()
  const cipher = crypto.createCipheriv(algorithm, result, iv)
  const encrypted = cipher.update(data)
  const final = cipher.final()
  const tag = cipher.getAuthTag()
  const res = Buffer.concat([encrypted, final, tag])
  return res.toString('base64')
}

/**
 * aes解密
 * @param encrypted 待解密数据
 * @param algorithm 加密算法
 * @param secretKey 密钥
 * @param iv 初始向量
 * @returns {*}
 */
function aesDecrypt (encrypted, algorithm, secretKey, iv) {
  const md5 = crypto.createHash('md5')
  const result = md5.update(secretKey).digest()
  const decipher = crypto.createDecipheriv(algorithm, result, iv)

  const buf = Buffer.from(encrypted, 'base64')
  decipher.setAuthTag(buf.subarray(buf.length - 16))
  return decipher.update(buf.subarray(0, buf.length - 16)) + decipher.final('utf8')
}

module.exports = {
  aesEncrypt,
  aesDecrypt
}
