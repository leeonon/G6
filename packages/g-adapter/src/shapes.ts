import { isString, isObject, isArray } from '@antv/util';
import {
  Rect as GRect,
  Circle as GCircle,
  Ellipse as GEllipse,
  Polygon as GPolygon,
  Path as GPath,
  Image as GImage,
  Line as GLine,
  Polyline as GPolyline,
  Text as GText,
  HTML as GHTML,
  decompose
} from '@antv/g';
import { Arrow as GArrow } from '@antv/g-components';
import { ext, mat3 } from '@antv/matrix-util';
import { unitMatrix } from './utils/matrix';
import { attr, createClipShape, getLineTangent, getPathBySymbol, isArrowKey, isCombinedShapeSharedAttr } from './utils/shape';
import { getArrowHead, updateArrow } from './utils/arrow';
import { processAnimate } from './utils/animate';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#Z8ZDU

// ● 继承新 G 所有内容
// ● getMatrix  同 Group
// ● setMatrix/applyMatrix  同 Group
// ● getBBox  同 Group
// ● getCanvasBBox  同 Group
// ● animate  同 Group

// Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text 这些图形都继承上述内容
// 看情况是否要全部改写，需要的话建一个文件夹包裹所有 shape 相关文件

const getBBox = (shape, type = 'bBox') => {
  const aabb = type === 'bBox' ? shape.getLocalBounds() : shape.getBounds();
  return {
    minX: aabb.min[0],
    maxX: aabb.max[0],
    minY: aabb.min[1],
    maxY: aabb.max[1],
    x: aabb.min[0],
    y: aabb.min[1],
    width: aabb.max[0] - aabb.min[0],
    height: aabb.max[1] - aabb.min[1],
  }
}

const varNames = [
  'cfg',
  'clone',
  'attrs',
  'attr',
  'getParent',
  'getCanvas',
  'applyMatrix',
  'getCanvasBBox',
  'getBBox',
  'isCanvas',
  'isGroup',
  'on',
  'once',
  'resetMatrix',
  'rotateAtStart',
  'rotateAtPoint',
  'getClip',
  'moveTo',
  // 'animate',
  'pauseAnimate',
  'stopAnimate',
  'resumeAnimate'
];

const handlerFunctionMap = {
  'cfg': target => target.config,
  'clone': target => () => {
    const clonedShape = target.cloneNode(true);
    const oriId = target.get('id');
    clonedShape.set('id', `cloned-${oriId}`);
    clonedShape.id = `cloned-${oriId}`;
    return clonedShape;
  },
  'attr': target => (param1, param2) => attr(param1, param2, target),
  'getParent': target => () => target.parentNode,
  'getCanvas': target => () => target.get('canvas'),
  'applyMatrix': target => (matrix) => target.setLocalMatrix(matrix),
  'resetMatrix': target => () => target.setLocalMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]),
  'getBBox': target => () => getBBox(target, 'bBox'),
  'getCanvasBBox': target => () => getBBox(target, 'canvasBBox'),
  'isCanvas': target => () => false,
  'isGroup': target => () => false,
  'on': target => (eventname: string, callback, once?: boolean) => target.addEventListener(eventname, callback, { once }),
  'once': target => (eventname: string, callback) => target.addEventListener(eventname, callback, { once: true }),
  'rotateAtStart': target => (rotate: number) => { // rotate 弧度制
    target.setOrigin(0, 0)
    target.rotateLocal(rotate / Math.PI * 180);
  },
  'rotateAtPoint': target => (x: number, y: number, rotate: number) => {
    target.setOrigin(x, y);
    target.rotateLocal(rotate / Math.PI * 180);
  },
  'getClip': target => () => target.get('clipShape'),
  'moveTo': target => (toX, toY) => target.move(toX, toY),
  'stopAnimate': target => () => {
    const animations = target.get('animations');
    animations?.forEach((animation) => {
      // 将动画执行到最后一帧
      animation.onframe({ target: animation, propRatio: 1 });
      animation.finish();
    });
    // target.set('animating', false);
    target.set('animations', []);
  },
  'pauseAnimate': target => () => {
    const animations = target.get('animations');
    animations?.forEach((animation: Animation) => {
      animation.pause();
      // @ts-ignore
      animation._onAdapterPause?.();
      target.isPaused = true;
    });
    return target;
  },
  'resumeAnimate': target => () => {
    const animations = target.get('animations');
    // 之后更新属性需要计算动画已经执行的时长，如果暂停了，就把初始时间调后
    animations?.forEach((animation: Animation) => {
      animation.play();
      // @ts-ignore
      animation._onResumePause?.();
      target.isPaused = false;
    });
    target.set('animations', animations);
    return target;
  },
}

const handler = {
  get: (target, prop) => {
    if (handlerFunctionMap[prop]) {
      return handlerFunctionMap[prop](target);
    }
    return target[prop];
  }
}

const lineVarNames = varNames.concat(['getTotalLength', 'getPoint', 'getStartTangent', 'getEndTangent']);
const lineHandlerFunctionMap = {
  'attr': target => (param1Prop, param2) => {
    const bodyShape = target.getBody();
    const param1 = param1Prop === 'lineAppendWidth' ? 'increasedLineWidthForHitTesting' : param1Prop;
    if (param1 === undefined) {
      // 若不存在参数，则代表取出所有 attrs
      const bodyAttrs = target.getBody().attributes;
      const targetAttributes = { ...target.attributes };
      delete targetAttributes.body;
      delete targetAttributes.startHead;
      delete targetAttributes.endHead;
      const attrs = {
        ...targetAttributes,
        ...bodyAttrs,
        startArrow: target.config?.startArrow,
        endArrow: target.config?.endArrow,
      }
      delete attrs.x;
      delete attrs.y;
      delete attrs.z;
      return attrs;
    }
    let paramObj = param1;
    if (isString(param1)) {
      // 第一个参数是 string，不存在第二个参数 -> 取出一个值
      if (param2 === undefined) {
        if (param1 === 'matrix') return target.getMatrix();
        return (isArrowKey(param1)) ? target.config[param1] : bodyShape.style?.[param1] || target.style?.[param1];
      }
      // 第一个参数是 string，第二个参数存在 -> 设置一个值。成为参数对象在后面统一处理
      paramObj = { [param1]: param2 }
    }
    if (isObject(paramObj)) {
      // 第一个参数是对象 -> 设置对象中的所有值，忽略后面的参数
      Object.keys(paramObj).forEach(key => {
        if (isArrowKey(key)) {
          updateArrow(target, key, paramObj[key]);
          target.config[key] = paramObj[key];
        } else {
          target.style[key] = paramObj[key];
          bodyShape.style[key] = paramObj[key];
          // 若是箭头共用样式，需要同时更新箭头
          if (isCombinedShapeSharedAttr(key)) {
            if (target.startHead?.style) target.startHead.style[key] = paramObj[key];
            if (target.endHead?.style) target.endHead.style[key] = paramObj[key];
          }
        }
      });
      return paramObj;
    }
    return;
  },
  'getTotalLength': target => () => target.getBody().getTotalLength(),
  'getPoint': target => (ratio: number) => target.getBody().getPoint(ratio),
  'getStartTangent': target => () => {
    const bodyShape = target.getBody();
    if (bodyShape.getStartTangent) {
      return bodyShape.getStartTangent()
    } else {
      // 直线
      return getLineTangent(bodyShape, 'start');
    }
  },
  'getEndTangent': target => () => {
    const bodyShape = target.getBody();
    if (bodyShape.getStartTangent) {
      return bodyShape.getEndTangent()
    } else {
      // 直线
      return getLineTangent(bodyShape, 'end');
    }
  }
}
const lineHandler = {
  get: (target, prop) => {
    const func = lineHandlerFunctionMap[prop] || handlerFunctionMap[prop];
    if (func) return func(target);
    return target[prop];
  }
}

const setFunc = (shape, name, value) => {
  switch (name) {
    case 'capture':
      shape.interactive = value;
      break;
    case 'visible':
      if (value) shape.show();
      else shape.hide();
      break;
    case 'zIndex':
      shape.style[name] = value;
      break;
  }
  shape.cfg[name] = value;
}

const getFunc = (shape, name, superValue) => {
  switch (name) {
    case 'children':
      return shape.childNodes;
    case 'capture':
      return shape.interactive;
    case 'visible':
      return shape.attributes.visibility === 'visible' || shape.attributes.visibility === '';
    case 'zIndex':
      return shape.style.zIndex;
    case 'type':
      if (superValue === 'arrow') return shape.style?.body?.get('type') || superValue;
    default:
      return superValue;
  }
}


class Circle extends GCircle {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'circle';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}
class Rect extends GRect {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'rect';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}
class Ellipse extends GEllipse {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'ellipse';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class Text extends GText {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'text';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class Polygon extends GPolygon {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'polygon';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class Image extends GImage {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'image';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class Line extends GLine {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'simple-line';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class Polyline extends GPolyline {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'simple-polyline';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}
class Path extends GPath {
  public shapeType: string;
  constructor(cfg) {
    delete cfg.style.x;
    delete cfg.style.y;
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'simple-path';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public getMatrix() {
    const matrix = super.getMatrix(this.getLocalTransform()) || unitMatrix;
    return Array.from(matrix) as mat3;
  }

  public setMatrix(matrix) {
    const [tx, ty, scalingX, scalingY, angle] = decompose(matrix);
    this.setLocalEulerAngles(angle).setLocalPosition(tx, ty).setLocalScale(scalingX, scalingY);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class Marker extends Path {
  public shapeType: string;
  constructor(cfg) {
    const path = getPathBySymbol(cfg.style);
    if (!path) {
      console.warn('The symbol for the marker shape is invalid!');
      return;
    }
    cfg.style.path = path;
    delete cfg.style.x;
    delete cfg.style.y;
    super(cfg);
    this.shapeType = 'marker';
  }
}


class HTML extends GHTML {
  public shapeType: string;
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    varNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.shapeType = 'html';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  public setClip(clipCfg) {
    // clipCfg.attrs 中的 x y 是相对于被裁减图形的坐标系的
    const clipShape = createClipShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.get('canvas')
    );
    this.set('clipShape', clipShape);
    super.setClip(clipShape as any);
    return clipShape
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

const getLineConstructCfg = (cfg, Shape) => {
  const { style, ...otherCfg } = cfg;
  const { startArrow, endArrow, lineAppendWidth, ...otherAttrs } = style;
  if (isArray(otherAttrs.path)) {
    otherAttrs.path.forEach(pathItem => {
      pathItem.forEach((item, i) => {
        if (typeof item === 'number' && isNaN(item)) pathItem[i] = 0;
      })
    })
  }

  // 分离 body 的样式和共享样式
  const sharedStyle = {};
  const bodyStyle = {};
  Object.keys(otherAttrs).forEach(key => {
    if (isCombinedShapeSharedAttr(key)) {
      sharedStyle[key] = otherAttrs[key];
    } else {
      bodyStyle[key] = otherAttrs[key];
    }
  })
  const increasedLineWidthForHitTesting = lineAppendWidth || style.lineWidth || 1;
  const body = new Shape({
    style: {
      ...bodyStyle,
      increasedLineWidthForHitTesting,
      x: 0,
      y: 0
    }
  });

  const startHead = getArrowHead(startArrow);
  const endHead = getArrowHead(endArrow);

  const combinedStyle = {
    body,
    startHead,
    endHead,
    ...sharedStyle,
    increasedLineWidthForHitTesting,
    x: 0,
    y: 0
  }

  return {
    style: combinedStyle,
    ...otherCfg,
    x: 0,
    y: 0
  };
}

class LineWithArrow extends GArrow {
  public shapeType: string;
  constructor(cfg) {
    super(getLineConstructCfg(cfg, Line));

    const { startArrow, endArrow } = cfg?.style || {};

    const proxy = new Proxy(this, lineHandler);
    proxy.combinedShape = true;
    // attr 和其他图形不同
    lineVarNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.set('startArrow', startArrow);
    this.set('endArrow', endArrow);
    this.shapeType = 'line';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    // @ts-ignore
    this.getBody().animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class PathWithArrow extends GArrow {
  public shapeType: string;
  constructor(cfg) {

    super(getLineConstructCfg(cfg, Path));

    const { startArrow, endArrow } = cfg?.style || {};

    const proxy = new Proxy(this, lineHandler);
    proxy.combinedShape = true;
    // attr 和其他图形不同
    lineVarNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.set('startArrow', startArrow);
    this.set('endArrow', endArrow);
    this.shapeType = 'path';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    // @ts-ignore
    this.getBody().animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

class PolylineWithArrow extends GArrow {
  public shapeType: string;
  constructor(cfg) {

    super(getLineConstructCfg(cfg, Polyline));

    const { startArrow, endArrow } = cfg?.style || {};

    const proxy = new Proxy(this, lineHandler);
    proxy.combinedShape = true;
    // attr 和其他图形不同
    lineVarNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    this.set('startArrow', startArrow);
    this.set('endArrow', endArrow);
    this.shapeType = 'polyline';
    return this;
  }

  public set(name, value) {
    super.set(name, value);
    return setFunc(this, name, value);
  }

  public get(name) {
    const superValue = super.get(name);
    return getFunc(this, name, superValue);
  }

  // @ts-ignore
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => super.animate(...args);
    // @ts-ignore
    this.getBody().animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }
}

export { Circle, Rect, Ellipse, Text, Polygon, Image, HTML, Marker, Path, LineWithArrow, PathWithArrow, PolylineWithArrow }