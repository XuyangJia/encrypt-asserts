module.exports = function (arr) {
  arr = Array.isArray(arr) ? arr.slice() : []
  let len = arr.length
  let i
  let temp
  while (len) {
    i = Math.floor(Math.random() * len--)
    temp = arr[i]
    arr[i] = arr[len]
    arr[len] = temp
  }
  return arr
}
