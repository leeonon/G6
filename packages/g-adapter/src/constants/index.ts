// import { Circle, Rect, Ellipse, Polygon, Image, Path, Text, HTML, Line } from '@antv/g';
import { Circle, Rect, Ellipse, Polygon, Image, Path, Text, HTML, Marker, LineWithArrow, PolylineWithArrow, PathWithArrow } from '../shapes';

const EVENTS = [
  'click',
  'dblclick',
  'rightup',
  'dragstart',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragout', // TODO: not in documentation page: https://g6.antv.vision/en/docs/api/Event/, 
  'drop',
  'focus',
  'blur',
  'keyup',
  'keydown',
  'mousedown',
  'mouseenter',
  'mouseup',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseleave',
  'touchstart',
  'touchmove',
  'touchend',
  'contextmenu',
  'wheel'
] as const;

const CLONE_CFGS = ['zIndex', 'capture', 'visible'];
const SHAPE_CLASS_MAP = {
  'circle': Circle,
  'rect': Rect,
  'ellipse': Ellipse,
  'polygon': Polygon,
  'image': Image,
  // 'path': Path,
  'text': Text,
  'dom': HTML,
  // 'line': Line,
  'line': LineWithArrow,
  'polyline': PolylineWithArrow,
  'path': PathWithArrow,
  'marker': Marker, // TODO: 暂时没有 Marker
  'simple-path': Path
}
const SYMBOL_PATH_FUNC_MAP = {
  'circle': (x, y, r) => [
    ['M', x - r, y],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
  ],
  'square': (x, y, r) => [
    ['M', x - r, y - r],
    ['L', x + r, y - r],
    ['L', x + r, y + r],
    ['L', x - r, y + r],
    ['L', x - r, y - r],
  ],
  'diamond': (x, y, r) => [
    ['M', x - r, y],
    ['L', x, y - r],
    ['L', x + r, y],
    ['L', x, y + r],
    ['L', x - r, y],
  ],
  'triangle': (x, y, r) => [
    ['M', x - r, y + r],
    ['L', x + r, y + r],
    ['L', x, y - r],
    ['L', x - r, y + r],
  ],
  'triangle-down': (x, y, r) => [
    ['M', x - r, y - r],
    ['L', x + r, y - r],
    ['L', x, y + r],
    ['L', x - r, y - r],
  ],
}

export { CLONE_CFGS, SHAPE_CLASS_MAP, SYMBOL_PATH_FUNC_MAP, EVENTS };
