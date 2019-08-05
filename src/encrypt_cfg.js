module.exports = {
  'algorithm': 'aes-128-cbc', // 加密算法
  'encryptKey': '4e4168d79181dfd2', // 密钥
  'iv': '0123456789ABCDEF', // 偏移向量
  'namesFile': 'cfg', // 已加密的所有文件的文件名（这个文件也是加密的）
  'versionFile': 'version.json', // sg项目配置文件
  'inputDir': '../release/web66', // 项目原始目录
  'outputDir': '../release/web67', // 项目加密后的输出目录
  'decryptDir': '../release/web68', // 项目解密后的输出目录
  'encryptIgnore': ['index.html'], // 不需要加密的文件
  'renameIgnore': ['.html', '.js'], // 不需要重命名的文件类型
  'confusionRatio': 0.1, // 插入混淆文件的比例
  'dirMap': { // 一级目录中存放的文件类型映射表
    'imgs': ['.jpg', '.png'],
    'music': ['.aac', '.mp3', '.ogg', '.m4a'],
    'font': ['.fnt', '.ttf', '.woff', '.woff2', '.eot'],
    'cfgs': ['.json', '.xml'],
    'animation': ['.ani'],
    'particle': ['.part']
  },
  'minFilesNum': 20, // 生成子目录需要的最少文件数量
  'maxDirNum': 10 // 单个目录内 子目录的最大数量
}
