import { Path } from '../shapes';

const getDefaultArrow = (pathStyle) => {
  const { sin, cos, PI } = Math;
  return new Path({
    style: {
      ...pathStyle,
      anchor: [0, 0.5],
      path: `M${10 * cos(PI / 6)},${10 * sin(PI / 6)} L0,0 L${10 * cos(PI / 6)},-${10 *
        sin(PI / 6)}`,
    },
  });
}

const getArrowHead = (arrow) => {
  let arrowHead: boolean | Path = false;
  if (arrow === true) {
    arrowHead = true;
  }
  if (typeof arrow === 'object') {
    if (arrow.nodeName) {
      arrowHead = arrow;
    } else {
      const { d, ...otherAttrs } = arrow;
      arrowHead = new Path({
        style: {
          x: 0,
          y: 0,
          ...otherAttrs,
        }
      });
    }
  }
  return arrowHead;
}

const updateArrow = (combinedShape, key, value) => {
  if (!combinedShape) return;
  if (!value) {
    key === 'startArrow' ? combinedShape.style.startHead = false : combinedShape.style.endHead = false;
    return;
  }
  const { d = 0, ...arrowStyle } = value;
  const arrow = key === 'startArrow' ? combinedShape.getStartHead() : combinedShape.getEndHead();
  // TODO: 需要确定 G 更新箭头的方法 https://codesandbox.io/s/how-to-update-arrow-head-f2qbl3?file=/index.js
  // arrow.attr(arrowStyle);
  // // const newArrow = getArrowHead(arrowStyle);
  // if (key === 'startArrow') {
  //   // combinedShape.style.startHead = newArrow;
  //   combinedShape.style.startHeadOffset = - 2 * d;
  // } else {
  //   // combinedShape.style.endHead = newArrow;
  //   combinedShape.style.endHeadOffset = - 2 * d;
  // }
}

export { getDefaultArrow, getArrowHead, updateArrow };