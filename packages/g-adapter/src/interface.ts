import EventEmitter from '@antv/event-emitter';
import {
  DisplayObject,
  IElement as GIElement,
  Group as GGroup,
  DisplayObject as GShape,
  Canvas as GCanvas
} from '@antv/g';
import {
  BBox,
  ShapeAttrs,
  ClipCfg,
  ElementCfg,
  Renderer,
  Cursor,
  AnimateCfg,
  OnFrame,
  ShapeCfg,
  ElementFilterFn,
  Point
} from './types';

/**
 * @interface IBase
 * 所有图形类公共的接口，提供 get,set 方法
 */
export interface IBase extends EventEmitter {
  /**
   * 绑定单次监听
   * @param  {string} eventname 事件名称
   * @param {Function} callback 监听函数
   */
  once: (eventname: string, callback: Function) => this;
  /**
   * 获取属性值
   * @param  {string} name 属性名
   * @return {any} 属性值
   */
  get: (name: string) => any;
  /**
   * 设置属性值
   * @param {string} name  属性名称
   * @param {any}    value 属性值
   */
  set: (name: string, value: any) => void;

  /**
   * 是否销毁
   * @type {boolean}
   */
  destroyed: boolean;

  /**
   * 销毁对象
   */
  destroy: () => void;
}

/**
 * @interface
 * 图形元素的基类
 */

export interface IElement extends IBase {
  cfg: ElementCfg;
  destroyed: boolean;
  adaptedEle: GShape | GGroup;
  isPaused: boolean;
  nodeName?: string;
  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent: () => IContainer;
  /**
   * 获取所属的 Canvas
   * @return {ICanvas} Canvas 对象
   */
  getCanvas: () => ICanvas;
  /**
   * 是否是分组
   * @return {boolean} 是否是分组
   */
  isGroup: () => boolean;
  /**
   * 从父元素中移除
   * @param {boolean} destroy 是否同时销毁
   */
  remove: (destroy?: boolean) => void;
  /**
   * 根据参数获取属性、设置属性
   */
  attr: (param1?: string | ShapeAttrs, param2?: any) => void | any;

  // /**
  //  * 获取全量的图形属性
  //  */
  // attr();
  // /**
  //  * 获取图形属性
  //  * @param {string} name 图形属性名
  //  * @returns 图形属性值
  //  */
  // attr(name: string): any;
  // /**
  //  * 设置图形属性
  //  * @param {string} name  图形属性名
  //  * @param {any}    value 图形属性值
  //  */
  // attr(name: string, value: any);
  // /**
  //  * 设置图形属性
  //  * @param {object} attrs 图形属性配置项，键值对方式
  //  */
  // attr(attrs: ShapeAttrs);

  /**
   * 获取包围盒，这个包围盒是相对于图形元素自己，不会计算 matrix
   * @returns {BBox} 包围盒
   */
  getBBox: () => BBox;
  /**
   * 获取图形元素相对画布的包围盒，会计算从顶层到当前的 matrix
   * @returns {BBox} 包围盒
   */
  getCanvasBBox: () => BBox;
  /**
   * 复制对象
   */
  clone: () => IGroup | IShape;
  /**
   * 显示
   */
  show: () => void;
  /**
   * 隐藏
   */
  hide: () => void;
  /**
   * 设置 zIndex
   */
  setZIndex: (zIndex: number) => void;
  /**
   * 层级移到最上层
   */
  toFront: () => void;
  /**
   * 层级移到最下层
   */
  toBack: () => void;
  /**
   * 清除掉所有平移、旋转和缩放
   */
  resetMatrix: () => void;
  /**
   * 获取 transform 后的矩阵
   * @return {number[]} 矩阵
   */
  getMatrix: () => number[];
  /**
   * 设置 transform 的矩阵
   * @param {number[]} matrix 应用到图形元素的矩阵
   */
  setMatrix: (matrix: number[]) => void;
  /**
   * 将向量应用设置的矩阵
   * @param {number[]} vector 向量
   */
  applyToMatrix: (vector: number[]) => void;
  /**
   * 根据设置的矩阵，将向量转换相对于图形/分组的位置
   * @param {number[]} vector 向量
   */
  invertFromMatrix: (vector: number[]) => void;
  /**
   * 设置 clip ，会在内部转换成对应的图形
   * @param {ClipCfg} clipCfg 配置项
   */
  setClip: (clipCfg: ClipCfg) => void;
  /**
   * 获取 clip ，clip 对象是一个 Shape
   * @returns {IElement} clip 的 Shape
   */
  getClip: () => IElement;
  /**
   * 移动元素
   * @param {number} x x 轴方向的移动距离
   * @param {number} y y 轴方向的移动距离
   * @return {IElement} 元素
   */
  translate: (x?: number, y?: number) => IElement;
  /**
   * 移动元素到目标位置
   * @param {number} toX 目标位置的 x 轴坐标
   * @param {number} toY 目标位置的 y 轴坐标
   * @return {IElement} 元素
   */
  move: (toX: number, toY: number) => IElement;
  /**
   * 移动元素到目标位置，等价于 move 方法。由于 moveTo 的语义性更强，因此在文档中推荐使用 moveTo 方法
   * @param {number} targetX 目标位置的 x 轴坐标
   * @param {number} targetY 目标位置的 y 轴坐标
   * @return {IElement} 元素
   */
  moveTo: (toX: number, toY: number) => IElement;
  /**
   * 缩放元素
   * @param {number} ratio 各个方向的缩放比例
   * @return {IElement} 元素
   */
  scale(ratio: number): IElement;
  /**
  * 缩放元素
  * @param {number} ratioX x 方向的缩放比例
  * @param {number} ratioY y 方向的缩放比例
  * @return {IElement} 元素
  */
  scale(ratioX: number, ratioY: number): IElement;
  /**
  * 缩放元素
  * @param {number} ratioX x 方向的缩放比例
  * @param {number} ratioY y 方向的缩放比例
  * @param {Point} center 缩放中心，默认为 { x: 0, y: 0 }
  * @return {IElement} 元素
  */
  scale(ratioX: number, ratioY: number, center: Point): IElement;
  /**
   * 以画布左上角 (0, 0) 为中心旋转元素
   * @param {number} radian 旋转角度(弧度值)
   * @return {IElement} 元素
   */
  rotate: (radian: number) => IElement;
  /**
   * 以起始点为中心旋转元素
   * @param {number} radian 旋转角度(弧度值)
   * @return {IElement} 元素
   */
  rotateAtStart: (rotate: number) => IElement;
  /**
   * 以任意点 (x, y) 为中心旋转元素
   * @param {number} radian 旋转角度(弧度值)
   * @return {IElement} 元素
   */
  rotateAtPoint: (x: number, y: number, rotate: number) => IElement;
  /**
   * 执行动画
   * @param {ShapeAttrs} toAttrs 动画最终状态
   * @param {number}       duration 动画执行时间
   * @param {string}       easing 动画缓动效果
   * @param {function}     callback 动画执行后的回调
   * @param {number}       delay 动画延迟时间
   */
  animate(
    toAttrs: ShapeAttrs,
    duration: number,
    easing?: string,
    callback?: Function,
    delay?: number
  );
  /**
   * 执行动画
   * @param {OnFrame}  onFrame  自定义帧动画函数
   * @param {number}   duration 动画执行时间
   * @param {string}   easing   动画缓动效果
   * @param {function} callback 动画执行后的回调
   * @param {number}   delay    动画延迟时间
   */
  animate(
    onFrame: OnFrame,
    duration: number,
    easing?: string,
    callback?: Function,
    delay?: number
  );
  /**
   * 执行动画
   * @param {ShapeAttrs} toAttrs 动画最终状态
   * @param {AnimateCfg}   cfg     动画配置
   */
  animate(toAttrs, cfg: AnimateCfg);
  /**
   * 执行动画
   * @param {OnFrame}    onFrame 自定义帧动画函数
   * @param {AnimateCfg} cfg     动画配置
   */
  animate(onFrame, cfg: AnimateCfg);
  /**
   * 停止图形的动画
   * @param {boolean} toEnd 是否到动画的最终状态
   */
  stopAnimate(toEnd?: boolean);
  /**
   * 暂停图形的动画
   */
  pauseAnimate();
  /**
   * 恢复暂停的动画
   */
  resumeAnimate();
  /**
   * 是否处于动画暂停状态
   * @return {boolean} 是否处于动画暂停状态
   */
  isAnimatePaused();
}

export interface IShape extends IElement {
  shapeType: string
}

export interface IContainer extends IElement {
  /**
   * 添加图形
  //  * @param {string} param1 图形类型或带有 type 的图形配置项
  //  * @param {ShapeCfg} param2  图形配置项
   * @returns 添加的图形对象
   */
  addShape(param1: ShapeCfg | string, param2?: ShapeCfg): IShape;
  /**
   * 容器是否是 Canvas 画布
   */
  isCanvas: () => {};
  /**
   * 添加图形分组，并设置配置项
   * @param {GroupCfg} cfg 图形分组的配置项
   * @returns 添加的图形分组
   */
  addGroup(cfg?: ElementCfg): IGroup;
  /**
   * 获取父元素
   * @return {IContainer} 父元素一般是 Group 或者是 Canvas
   */
  getParent: () => IContainer;
  /**
   * 获取所有的子元素
   * @return {IElement[]} 子元素的集合
   */
  getChildren: () => IElement[];
  /**
   * 子元素按照 zIndex 进行排序
   */
  sort: () => void;
  /**
   * 清理所有的子元素
   */
  clear: () => void;
  /**
   * 获取第一个子元素
   * @return {IElement} 第一个元素
   */
  getFirst: () => IElement;
  /**
   * 获取最后一个子元素
   * @return {IElement} 元素
   */
  getLast: () => IElement;
  /**
   * 根据索引获取子元素
   * @return {IElement} 第一个元素
   */
  getChildByIndex: (index: number) => IElement;
  /**
   * 子元素的数量
   * @return {number} 子元素数量
   */
  getCount: () => number;
  /**
   * 是否包含对应元素
   * @param {IElement} element 元素
   * @return {boolean}
   */
  contain: (element: IElement) => boolean;
  /**
   * 移除对应子元素
   * @param {IElement} element 子元素
   * @param {boolean} destroy 是否销毁子元素，默认为 true
   */
  removeChild: (element: IElement, destroy?: boolean) => void;
  /**
   * 查找所有匹配的元素
   * @param  {ElementFilterFn} fn 匹配函数
   * @return {IElement[]} 元素数组
   */
  findAll: (fn: ElementFilterFn) => (IElement)[];
  /**
   * 查找元素，找到第一个返回
   * @param  {ElementFilterFn} fn 匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find: (fn: ElementFilterFn) => IElement;
  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement | null} 元素
   */
  findById: (id: string) => IElement;
  /**
   * 该方法即将废弃，不建议使用
   * 根据 className 查找元素
   * TODO: 该方法暂时只给 G6 3.3 以后的版本使用，待 G6 中的 findByClassName 方法移除后，G 也需要同步移除
   * @param {string} className 元素 className
   * @return {IElement | null} 元素
   */
  findByClassName: (className: string) => IElement;
  /**
   * 根据 name 查找元素列表
   * @param {string}      name 元素名称
   * @return {IElement[]} 元素
   * 是否是实体分组，即对应实际的渲染元素
   * @return {boolean} 是否是实体分组
   */
  findAllByName: (name: string) => (IElement)[];
}

export interface IGroup extends IContainer {
  adaptedEle: GGroup;
  children: IElement[];
  shapeMap?: {
    [key: string]: IElement
  }
  appendChild: (ele: IElement) => void;
}

export interface ICanvas extends IBase {
  /** the root group of the adpated canvas */
  adaptedEle: GGroup;
  canvasEle: GCanvas;
  isPaused: boolean;
  /**
   * 获取当前的渲染引擎
   * @return {'svg' | 'canvas' | 'webgl'} 返回当前的渲染引擎类型 'svg' | 'canvas' | 'webgl'
   */
  getRenderer: () => 'svg' | 'canvas' | 'webgl';
  /**
   * 持续向上查找 parent
   * @return {IContainer} 返回元素的父容器，在 canvas 中始终是 null
   */
  getParent(): IContainer;
  getParent(): DisplayObject | null;
  /**
   * get the matrix of the root group
   */
  getMatrix(): number[];
  /**
   * 获取画布的 cursor 样式
   * @return {Cursor}
   */
  getCursor: () => Cursor;
  /**
   * 设置画布的 cursor 样式
   * @param {Cursor} cursor  cursor 样式
   */
  setCursor: (cursor: Cursor) => void;
  /**
   * 改变画布大小
   * @param {number} width  宽度
   * @param {number} height 高度
   */
  changeSize: (width: number, height: number) => void;
  /**
   * 绘制
   */
  draw: () => void;
  /**
   * 是否是画布
   */
  isCanvas: () => boolean;
  /**
   * 是否是 Group
   */
  isGroup: () => boolean;
  /**
   * 添加图形分组，并设置配置项
   * @param {GroupCfg} cfg 图形分组的配置项
   * @returns 添加的图形分组
   */
  addGroup(cfg?: ElementCfg): IGroup;
  /**
   * add a child to the root group of the canvas
   * @param ele a shape or a group instance
   */
  appendChild(ele: IElement): Promise<IElement>;
  /**
   * 获取所有的子元素
   * @return {IElement[]} 子元素的集合
   */
  getChildren: () => IElement[];
  /**
   * get the root group of the canvas
   * @returns {IGroup} the root group
   */
  getGroup: () => IGroup;
  /**
   * get the canmera
   * @returns the canmera
   */
  getCamera: () => any;
  /**
   * 执行动画
   * @param {OnFrame}    onFrame 自定义帧动画函数
   * @param {AnimateCfg} cfg     动画配置
   */
  animate(onFrame: OnFrame, cfg: AnimateCfg);
  /**
   * transform client coordinate to drawing coordinate
   * @param {number} clientX x in client coordinate
   * @param {number} clientY y in client coordinate
   */
  getPointByClient(clientX: number, clientY: number): Point;
  /**
   * transform drawing coordinate to client coordinate
   * @param {number} clientX x in drawing coordinate
   * @param {number} clientY y in drawing coordinate
   */
  getClientByPoint(pointX: number, pointY: number): Point;
  /**
   * 查找所有匹配的元素
   * @param  {ElementFilterFn} fn 匹配函数
   * @return {IElement[]} 元素数组
   */
  findAll: (fn: ElementFilterFn) => (IElement)[];
  /**
   * 查找元素，找到第一个返回
   * @param  {ElementFilterFn} fn 匹配函数
   * @return {IElement|null} 元素，可以为空
   */
  find: (fn: ElementFilterFn) => IElement;
  /**
   * 根据 ID 查找元素
   * @param {string} id 元素 id
   * @return {IElement | null} 元素
   */
  findById: (id: string) => IElement;
  /**
   * 该方法即将废弃，不建议使用
   * 根据 className 查找元素
   * TODO: 该方法暂时只给 G6 3.3 以后的版本使用，待 G6 中的 findByClassName 方法移除后，G 也需要同步移除
   * @param {string} className 元素 className
   * @return {IElement | null} 元素
   */
  findByClassName: (className: string) => IElement;
  /**
   * 根据 name 查找元素列表
   * @param {string}      name 元素名称
   * @return {IElement[]} 元素
   * 是否是实体分组，即对应实际的渲染元素
   * @return {boolean} 是否是实体分组
   */
  findAllByName: (name: string) => (IElement)[];
  /**
   * 清理所有的子元素
   */
  clear: () => void;
  /**
   * 销毁
   */
  destroy: () => void;
}