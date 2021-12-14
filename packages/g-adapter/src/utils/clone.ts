import { isArray } from '@antv/util';

// 需要考虑数组嵌套数组的场景
// 数组嵌套对象的场景不考虑
function cloneArrayAttr(arr) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (isArray(arr[i])) {
      result.push([].concat(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

export default { cloneArrayAttr };