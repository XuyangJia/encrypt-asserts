const path = require('path')
const fse = require('fs-extra')
const projectDir = path.resolve('..')
const sourceDir = path.resolve(projectDir, 'release/web66')
const encryptedDir = sourceDir + '-encrypted'
const now = Date.now().toString(36)
const nameLib = ['apple', 'banana', 'strawberry', 'blueberry', 'cherry', 'chestnut', 'coconut', 'cranberry', 'durian', 'fig', 'peach', 'grape', 'lemon', 'longan', 'mango', 'melon', 'orange', 'papaya', 'pear', 'pineapple']

const versionObj = JSON.parse(fse.readFileSync(path.resolve(sourceDir, 'version.json')).toString())
Object.keys(versionObj).forEach(key => {
  const src = path.resolve(sourceDir, versionObj[key])
  const newName = '' + now
  const dest = path.resolve(encryptedDir, newName)
  fse.copyFileSync(src, dest)
})
console.log(path.basename(sourceDir))
console.log(now.toString(37))
