// import { Circle, Rect, Ellipse, Polygon, Image, Path, Text, HTML, Line } from '@antv/g';
import { Circle, Rect, Ellipse, Polygon, Image, Path, Text, HTML, Line } from '../shapes';

const CLONE_CFGS = ['zIndex', 'capture', 'visible'];
const SHAPE_CLASS_MAP = {
  'circle': Circle,
  'rect': Rect,
  'ellipse': Ellipse,
  'polygon': Polygon,
  'image': Image,
  'path': Path,
  'text': Text,
  'dom': HTML,
  'line': Line,
  'marker': Path, // TODO: 暂时没有 Marker
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

export { CLONE_CFGS, SHAPE_CLASS_MAP, SYMBOL_PATH_FUNC_MAP };
