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
      arrowHead = new Path({ style: { ...arrow, anchor: [0, 0.5] } });
    }
  }
  return arrowHead;
}

const updateArrow = (combinedShape, key, value) => {
  if (!combinedShape) return;
  const newArrow = getArrowHead(value);
  if (key === 'startArrow') {
    combinedShape.style.startHead = newArrow;
  } else {
    combinedShape.style.endHead = newArrow;
  }
}

export { getDefaultArrow, getArrowHead, updateArrow };