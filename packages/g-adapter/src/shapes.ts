import { DisplayObject as GShape } from '@antv/g';
import { isArray } from '@antv/util';
import {
  Rect as GRect,
  Circle as GCircle,
  Ellipse as GEllipse,
  Polygon as GPolygon,
  Path as GPath,
  Image as GImage,
  Line as GLine,
  Text as GText,
  HTML as GHTML
} from '@antv/g';
import CloneUtil from './utils/clone';
import { CLONE_CFGS } from './constants';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#Z8ZDU

// ● 继承新 G 所有内容
// ● getMatrix  同 Group
// ● setMatrix/applyMatrix  同 Group
// ● getBBox  同 Group
// ● getCanvasBBox  同 Group
// ● animate  同 Group

// Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text 这些图形都继承上述内容
// 看情况是否要全部改写，需要的话建一个文件夹包裹所有 shape 相关文件


const functionNames = ['clone'];

const handler = {
  get: (target, prop) => {
    if (prop === 'clone') {
      return () => {
        return target.cloneNode(true);
      }
    } else if (prop === 'testFunc') { // TODO 更多函数
      return () => console.log('=====', prop, '======');
    }
    return target[prop];
  }
}

class Circle extends GCircle {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}
class Rect extends GRect {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}
class Ellipse extends GEllipse {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

class Text extends GText {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

class Polygon extends GPolygon {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

class Path extends GPath {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

class Image extends GImage {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

class Line extends GLine {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

class HTML extends GHTML {
  constructor(cfg) {
    super(cfg);
    const proxy = new Proxy(this, handler);
    functionNames.forEach(funcName => {
      this[funcName] = proxy[funcName];
    });
    return this;
  }
}

export { Circle, Rect, Ellipse, Text, Polygon, Path, Image, Line, HTML }