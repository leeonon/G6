import { Canvas as GCanvas, Group } from '@antv/g';
import { DisplayObject as GShape } from '@antv/g';

function removeChild(container: Group, element: GShape, destroy: boolean = true) {
  // 不再调用 element.remove() 方法，会出现循环调用
  if (destroy) {
    element.destroy();
  } else {
    element.set('parent', null);
    element.set('canvas', null);
  }
  removeFromArray(container.getChildren(), element);
}

export function removeFromArray(arr: any[], obj: any) {
  const index = arr.indexOf(obj);
  if (index !== -1) {
    arr.splice(index, 1);
  }
}

export default {
  removeChild,
};
