import { CustomEvent as GEvent } from '@antv/g';
import Canvas from './canvas';
import Group from './group';
import { ShapeAttrs, ShapeCfg, ArrowCfg, ClipCfg, ElementCfg, ElementAttrs, Cursor, Renderer, OnFrame, AnimateCfg, BBox, Point } from './types';
import { IShape, IElement, IGroup, ICanvas } from './interface';
import { Circle, Rect, Ellipse, Text, Polygon, Marker, HTML, Image, LineWithArrow, PolylineWithArrow, PathWithArrow } from './shapes';
import { EVENTS } from './constants';

// 引入 G 中其它不需要改写的全部内容
// import { A, B, C, ... } from '@antv/g';

export {
  Canvas,
  Group,
  GEvent,

  Circle,
  Rect,
  Ellipse,
  Text,
  Polygon,
  Marker,
  HTML,
  Image,
  LineWithArrow as Line,
  PolylineWithArrow as Polyline,
  PathWithArrow as Path,

  IShape,
  IElement,
  IGroup,
  ICanvas,

  ShapeAttrs,
  ShapeCfg,
  ArrowCfg,
  ClipCfg,
  ElementCfg,
  ElementAttrs,
  Cursor,
  Renderer,
  OnFrame,
  AnimateCfg,
  BBox,
  Point,

  EVENTS
};