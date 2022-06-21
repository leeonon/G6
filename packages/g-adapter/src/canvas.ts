import { Canvas as GCanvas, CanvasConfig, Group as GGroup } from '@antv/g';
import EventEmitter from '@antv/event-emitter';
import { isString, noop } from '@antv/util';
import { Plugin as DragDropPlugin } from '@antv/g-plugin-dragndrop';

import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Renderer as SVGRenderer } from '@antv/g-svg';
import { Renderer as WebGLRenderer } from '@antv/g-webgl';

import Group from './group';
import { ICanvas, IElement } from './interface';
import { AnimateCfg, Cursor, ElementCfg, Renderer, OnFrame, Point, ElementFilterFn } from './types';
import { EVENTS, IGroup } from '.';
import { unitMatrix } from './utils/matrix';
import { createShape } from './utils/shape';

// https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#u0T2w

export default class Canvas extends EventEmitter implements ICanvas {

  public destroyed: boolean = false;
  public renderer: 'svg' | 'canvas' | 'webgl' | any;
  public rendererType: 'svg' | 'canvas' | 'webgl';
  public adaptedEle: GGroup; // root group
  public canvasEle: GCanvas; // canvas
  public isPaused: boolean;
  private children: IElement[]; // child groups and shapes
  private rootGroup: IGroup;

  constructor(cfg: CanvasConfig) {
    super();
    let renderer = cfg.renderer || 'Canvas';
    this.renderer = cfg.renderer;
    if (isString(renderer)) {
      this.rendererType = renderer as 'svg' | 'canvas' | 'webgl';
      switch (renderer.toLowerCase()) {
        case 'svg':
          renderer = new SVGRenderer();
          break;
        case 'webgl':
          renderer = new WebGLRenderer();
          break;
        default:
          renderer = new CanvasRenderer();
      }
    } else {
      // TODO: 如果传入的是 renderer 对象，那么如何确定 rendererType
    }
    // dragdrop 插件
    renderer.registerPlugin(new DragDropPlugin({
      overlap: 'pointer',
      isDocumentDraggable: true,
      isDocumentDroppable: true,
      dragstartDistanceThreshold: 10,
      dragstartTimeThreshold: 100
    }));
    cfg.renderer = renderer;
    cfg.devicePixelRatio = cfg.devicePixelRatio || cfg.pixelRatio;
    this.canvasEle = new GCanvas(cfg);
    this.adaptedEle = this.canvasEle.getRoot();
    this.rootGroup = new Group({ adaptedEle: this.adaptedEle }) as IGroup;
    this.set('children', []);

    // passive 为 false 才可以 e.preventDefault()
    this.canvasEle
      .getContextService()
      .getDomElement() // g-canvas/webgl 为 <canvas>，g-svg 为 <svg>
      .addEventListener(
        'wheel',
        (e) => e.preventDefault(),
        { passive: false },
      );
  }

  /**
   * add a group to the root group of the canvas
   * @param cfg configurations for the added group
   * @returns the newly added group
   */
  public addGroup(cfg: ElementCfg = {}) {
    // const group = new Group(cfg);
    const group = this.rootGroup.addGroup(cfg);
    this.appendChild(group);
    return group;
  }

  /**
   * add a child to the root group of the canvas
   * @param ele a shape or a group instance
   */
  public async appendChild(ele: IElement) {
    // TODO: canvas 初始化之前 appendChild 可能导致错误，但 await 就需要后续所有与画布内容的操作都要 await
    // await this.canvasEle.ready;
    this.rootGroup.appendChild(ele);
    ele.set('parent', this.rootGroup);
    ele.set('canvas', this);
    const children = this.getChildren() || [];
    this.set('children', children.concat([ele]));
    return ele;
  }

  /**
   * get the children groups or shapes of the canvas's root group
   * @returns children elements
   */
  public getChildren(): IElement[] {
    return this.children || [];
  }

  /**
   * get the root group of the canvas
   * @returns {IGroup} the root group
   */
  public getGroup(): IGroup {
    return this.rootGroup;
  }

  public getMatrix(): number[] {
    const matrix = this.adaptedEle.getLocalMatrix() || unitMatrix;
    return Array.from(matrix);
  }

  /**
   * get the canmera
   * @returns the canmera
   */
  public getCamera() {
    return this.canvasEle.getCamera();
  }

  /**
   * get function
   * @param {string} key the key of the properties of canvas
   * @returns {any} the value of the properties of canvas with key. if the key is 'el', returns the DOM node of the canvas
   */
  public get(key: string): any {
    switch (key) {
      case 'width':
      case 'height':
        return this.canvasEle.getConfig()?.[key];
      case 'el':
        return this.canvasEle.getContextService()?.getDomElement?.();
      case 'children':
        return this.children;
      case 'container':
        return (this.canvasEle.getContextService()?.getDomElement?.() as any)?.parentNode;
      default:
        return this.canvasEle.document?.[key];
    }
  }

  /**
   * set function
   * @param {string} key the key of the properties of canvas
   * @param {any} value the value of the property with key
   */
  public set(key: string, value: any) {
    if (key === 'el') return;
    if (key === 'children') {
      this.children = value;
      return;
    }
    if (this.canvasEle.document) this.canvasEle.document[key] = value;
  }

  /**
   * get the global bounding box of the root group of the canvas
   * @returns bbox
   */
  public getCanvasBBox() {
    const aabb = this.adaptedEle.getBounds();
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

  /**
   * get the local bounding box of the root group of the canvas
   * @returns bbox
   */
  public getBBox() {
    const aabb = this.adaptedEle.getLocalBounds();
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

  /**
   * bind listener to canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   * @param once only listen once
   */
  public on(eventname: string, callback: Function, once?: boolean) {
    this.canvasEle.addEventListener(eventname, callback as any, { once });
    return this;
  }

  /**
   * bind once listener to the root group of the canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   * @param once only listen once
   */
  public once(eventname: string, callback: Function) {
    this.on(eventname, callback as any, true);
    return this;
  }

  /**
   * remove listener from the root group of the canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   */
  public off(eventname: string, callback: Function) {
    if (eventname === '*' || !eventname) {
      this.canvasEle.removeAllEventListeners();
    } else {
      this.canvasEle.removeEventListener(eventname, callback as any);
    }
    return this;
  }

  /**
   * emit a event to the root group of the canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param event the event object param for listener
   */
  public emit(eventname: string, event: object) {
    const eventnames = eventname.split(':');
    const name = eventnames[1] || eventname;
    if (EVENTS.includes(name as typeof EVENTS[number])) {
      this.canvasEle.emit(eventname, event);
    } else {
      // 除内置事件外的其他事件，为自定义事件，需要使用 CustomEvent 并将参数放入 detail
      const gEvent = new CustomEvent(eventname, { detail: event });
      // TODO: canvas dispatchEvent 不接受 CustomEvent 类型？
      this.canvasEle.dispatchEvent(gEvent as any);
    }
    return this;
  }

  /**
   * if the object is a canvas
   * @returns {boolean} return true to distinguish from shape and group
   */
  public isCanvas(): boolean {
    return true;
  }

  /**
   * if the object is a group
   * @returns {boolean} return true to distinguish from shape and group
   */
  public isGroup(): boolean {
    return false
  }

  /**
   * change the size of the canvas
   * @param {number} width new width for canvas
   * @param {number} height new height for canvas
   */
  public changeSize(width: number, height: number) {
    this.canvasEle.resize(width, height);
  }

  /**
   * get the renderer of the canvas
   * @returns {Renderer} current renderer
   */
  public getRenderer(): 'svg' | 'canvas' | 'webgl' {
    return this.rendererType;
  }

  /**
   * the parent of the canvas is null
   * @returns null
   */
  public getParent() {
    return null;
  }

  /**
  * get the cursor of the canvas
  * @return {Cursor}
  */
  public getCursor(): Cursor {
    return this.get('cursor') || 'default';
  }

  /**
   * set the cursor for the canvas
   * @param {Cursor} cursor
   */
  public setCursor(cursor: Cursor) {
    this.set('cursor', cursor);
    // this.setCursor(cursor);
    this.get('el').style.cursor = cursor;
  }

  /** TOOD: 是否需要实现 */
  public draw() { }

  /**
   * set up the animate for the canvas
   * @param onFrame will be called in each frame
   * @param animateCfg the configuration of the animation
   */
  public animate(onFrame: OnFrame, animateCfg?: AnimateCfg) {
    // @ts-ignore
    const callAnimate = (...args) => this.adaptedEle.animate(...args);
    const animation = callAnimate(
      [],
      {
        duration: 500,
        ...animateCfg
      }
    );
    if (!animation) return;
    animation.onframe = (e: any) => {
      const { target, propRatio } = e;
      const computedTiming = (target as Animation).effect.getComputedTiming();
      const progress = propRatio === undefined ? computedTiming.progress : propRatio;
      onFrame?.(progress);
    };

    const { callback, pauseCallback = noop, resumeCallback = noop } = animateCfg;
    if (callback) {
      animation.onfinish = () => {
        callback();
      };
    }
    // @ts-ignore
    animation._onAdapterPause = pauseCallback;
    // @ts-ignore
    animation._onResumePause = resumeCallback;

    const animations = this.get('animations') || [];
    animations.push(animation);
    this.set('animations', animations);
  }

  /**
   * stop all the animations on the canvas. the animations will be executed to the end
   */
  public stopAnimate() {
    const animations = this.get('animations') || [];
    animations.forEach((animation) => {
      // 将动画执行到最后一帧
      animation.onframe({ target: animation, propRatio: 1 });
      animation.finish();
      animation.cancel();
    });
    this.set('animations', []);
  }

  /**
   * resume all the paused animation on the canvas
   */
  public resumeAnimate() {
    const animations = this.get('animations') || [];
    // 之后更新属性需要计算动画已经执行的时长，如果暂停了，就把初始时间调后
    animations.forEach((animation: Animation) => {
      animation.play();
      // @ts-ignore
      animation._onResumePause?.();
      this.isPaused = false;
    });
    this.set('animations', animations);
    return this;
  }

  /**
   * pause all the animation on the canvas
   */
  public pauseAnimate() {
    const animations = this.get('animations') || [];
    animations.forEach((animation: Animation) => {
      animation.pause();
      // @ts-ignore
      animation._onAdapterPause?.();
      this.isPaused = true;
    });
    return this;
  }

  /**
   * transform canvas DOM coordinate to drawing coordinate
   * @param {number} canvasX x in canvas DOM coordinate
   * @param {number} canvasY y in canvas DOM coordinate
   */
  public getPointByCanvas(canvasX: number, canvasY: number): Point {
    return this.canvasEle.viewport2Canvas({ x: canvasX, y: canvasY });
  }

  /**
   * transform drawing coordinate to canvas DOM coordinate
   * @param {number} x x in drawing coordinate
   * @param {number} y y in drawing coordinate
   */
  public getCanvasByPoint(x: number, y: number): Point {
    return this.canvasEle.canvas2Viewport({ x, y });
  }


  /**
   * transform client coordinate to drawing coordinate
   * @param {number} clientX x in client coordinate
   * @param {number} clientY y in client coordinate
   */
  public getPointByClient(clientX: number, clientY: number): Point {
    const viewportXY = this.canvasEle.client2Viewport({ x: clientX, y: clientY });
    return this.canvasEle.viewport2Canvas(viewportXY);
  }

  /**
   * transform drawing coordinate to client coordinate
   * @param {number} clientX x in drawing coordinate
   * @param {number} clientY y in drawing coordinate
   */
  public getClientByPoint(pointX: number, pointY: number): Point {
    const viewportXY = this.canvasEle.canvas2Viewport({ x: pointX, y: pointY });
    return this.canvasEle.viewport2Client(viewportXY);
  }

  /**
   * find a child according to the fun
   * @param  {ElementFilterFn} fn matching function
   * @return {Element | null} the matched child element
   */
  public find(fn: ElementFilterFn): IElement | null {
    return this.rootGroup.find(fn);
  }

  /**
   * find a child by id
   * @param  {string} id id of the child shape or group
   * @return {Element | null} the matched child element
   */
  public findById(id): IElement | null {
    return this.rootGroup.findById(id);
  }

  /**
   * find a child by className or name
   * @param  {string} name name of the child shape or group
   * @return {Element | null} the matched child element
   */
  public findByClassName(name: string) {
    return this.rootGroup.findByClassName(name);
  }

  /**
   * find all the matched child according to the fun
   * @param  {ElementFilterFn} fn matching function
   * @return {Element | null} the matched child element
   */
  public findAll(fn: ElementFilterFn): IElement[] {
    return this.rootGroup.findAll(fn);
  }

  /**
   * find all the matched child by name
   * @param  {string} name the name of the child shape or group
   * @return {Element | null} the matched child element
   */
  public findAllByName(name: string) {
    return this.rootGroup.findAllByName(name);
  }

  /**
   * clear the canvas
   */
  public clear() {
    if (this.destroyed) {
      return;
    }
    this.adaptedEle.removeChildren();
    this.canvasEle.removeChildren();
    this.rootGroup.clear();
    this.set('children', []);
  }

  /**
   * destroy the canvas
   */
  public destroy() {
    this.destroyed = true;
    this.set('destroyed', true);
    this.set('children', []);
    this.canvasEle.destroy();
  }
}