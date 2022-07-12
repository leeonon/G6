import { isFunction, isObject, isString } from '@antv/util';
import { TextStyleProps } from '@antv/g';
import { Circle, Path } from '../shapes';
import { SHAPE_CLASS_MAP, SYMBOL_PATH_FUNC_MAP } from '../constants';
import { IShape } from '../interface';


const TEXT_INHERITABLE_PROPS: Pick<
  TextStyleProps,
  'fontSize' | 'fontFamily' | 'fontWeight' | 'fontVariant' | 'fontStyle' | 'textAlign' | 'textBaseline' | 'lineWidth'
> = {
  fontSize: '16px',
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  fontVariant: 'normal',
  fontStyle: 'normal',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  lineWidth: 0
};


const getPathBySymbol = (attrs) => {
  let path;
  const { r = 5, x = 0, y = 0, symbol } = attrs;
  if (!symbol) return;
  if (isFunction(symbol)) {
    path = symbol(x, y, r);
  } else if (isString(symbol)) {
    path = SYMBOL_PATH_FUNC_MAP[symbol]?.(x, y, r);
  }
  return path;
}

const createShape = (shapeType, param, canvas) => {
  param.style.x = param.style.x || 0;
  param.style.y = param.style.y || 0;
  if (shapeType === 'circle' || shapeType === 'ellipse') {
    param.style.cx = param.style.x;
    param.style.cy = param.style.y;
  } else if (shapeType === 'text') {
    // default attributes for bbox calculating avoiding getBBox before canvas ready
    param.style = Object.assign({}, TEXT_INHERITABLE_PROPS, param.style);
  }
  const Shape = SHAPE_CLASS_MAP[shapeType] || Circle;
  const shape: IShape = new Shape(param);
  shape.set('canvas', canvas);

  if (param.style.rotate) {
    shape.rotateAtStart(param.style.rotate);
  }
  if (param.style.draggable !== false) shape.attr('draggable', true);
  if (param.style.droppable !== false) shape.attr('droppable', true);
  return shape;
}

const createClipShape = (propShapeType, param, canvas) => {
  let shapeType = propShapeType;
  // 若是 path 类型的 clip，不可以使用 g-adapter 抛出的 Path（它实际上是 PathWithArrow），需要用无箭头组合的 Path
  if (shapeType === 'path') shapeType = 'simple-path';
  return createShape(shapeType, param, canvas);
}

const isArrowKey = key => key === 'startArrow' || key === 'endArrow';

const combinedShapeSharedAttrKeys = [
  'lineWidth',
  'stroke',
  'cursor',
  'opacity',
  'strokeOpacity',
  'shadowColor',
  'shadowBlur'
];

const isCombinedShapeSharedAttr = key => combinedShapeSharedAttrKeys.includes(key);

const getLineTangent = (line, dir: 'start' | 'end' = 'end') => {
  const { x1, x2, y1, y2 } = line.style;
  return dir === 'start' ? [[x2, y2], [x1, y1]] : [[x1, y1], [x2, y2]]
}

const attr = (param1, param2, target) => {
  if (param1 === undefined) {
    // 若不存在参数，则代表取出所有 attrs
    return target.attributes;
  }
  let paramObj = param1;
  if (isString(param1)) {
    let key = param1;
    if (target.nodeName === 'circle' || target.nodeName === 'ellipse') {
      if (key === 'x' || key === 'y') key = `c${key}`;
    }

    if (param2 === undefined) {
      // 第一个参数是 string，不存在第二个参数 -> 取出一个值
      if (key === 'matrix') return target.getMatrix();
      return target.style?.[key];
    }
    // 第一个参数是 string，第二个参数存在 -> 设置一个值。成为参数对象在后面统一处理
    paramObj = { [key]: param2 };
  }
  if (isObject(paramObj)) {
    // 第一个参数是对象 -> 设置对象中的所有值，忽略后面的参数
    Object.keys(paramObj).forEach(key => {
      let value = paramObj[key];
      if (key === 'text') value = `${value}`;
      target.style[key] = value;
    });
    if (target.nodeName === 'circle' || target.nodeName === 'ellipse') {
      target.style.cx = target.style.x;
      target.style.cy = target.style.y;
    }
    return param1;
  }
  return;
}

const clearByUndefinedKeys = ['shadowColor'];
const formatAttrValue = (key, value) => {
  if (value === undefined) {
    if (clearByUndefinedKeys.includes(key)) {
      return '';
    }
  }
  return value;
}

// const attrKeyMap = {
//   startArrow
// };
// const getFormatAttrKey = (key: string) => attrKeyMap[key] || key;

export { getPathBySymbol, createShape, isArrowKey, isCombinedShapeSharedAttr, getLineTangent, attr, createClipShape, formatAttrValue };