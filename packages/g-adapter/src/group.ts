import { Group as GGroup, CustomEvent } from '@antv/g';
import { isString, uniqueId, mix } from '@antv/util';
import EventEmitter from '@antv/event-emitter';
import { attr, createShape } from './utils/shape';
import { processAnimate } from './utils/animate';
import { unitMatrix } from './utils/matrix';
import { ICanvas, IContainer, IElement, IGroup, IShape } from './interface';
import { ClipCfg, ElementCfg, ElementFilterFn, ShapeAttrs, Point } from './types';
import { EVENTS } from '.';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#vJTCy

export default class Group extends EventEmitter implements IGroup {

  public adaptedEle: GGroup;
  public cfg: ElementCfg;
  public attrs: ShapeAttrs;
  public destroyed: boolean = false;
  public isPaused: boolean = false;
  public children: IElement[] = [];
  private canvas: ICanvas;

  constructor(cfg: ElementCfg = {}) {
    super();
    this.cfg = mix(this.getDefaultCfg(), cfg);
    const gGroup = this.cfg.adaptedEle || new GGroup(this.cfg);
    this.adaptedEle = gGroup;
    this.set('children', []);
    this.cfg = cfg;
  }

  getDefaultCfg() {
    return {
      visible: true,
      capture: true,
      zIndex: 0,
      children: [],
    };
  }

  /**
   * add a group to the canvas
   * @param cfg configurations for the added group
   * @returns the newly added group
   */
  public addGroup(cfg?: ElementCfg) {
    const config = cfg || {
      id: `group-${uniqueId()}`
    };
    const group = new Group(config);
    this.appendChild(group);
    group.set('canvas', this.getCanvas());
    return group as IGroup;
  }

  /**
   * add a child to group
   * @param ele a shape or a group instance
   */
  public async appendChild(ele: IElement) {
    // TODO: canvas 初始化之前 appendChild 可能导致错误，但 await 就需要后续所有与画布内容的操作都要 await
    // if (this.adaptedEle.id === 'g-root' && this.adaptedEle.parentNode?.nodeName === 'document') {
    //   await (this.adaptedEle.parentNode as any)?.defaultView?.ready
    // }
    if (ele instanceof Group) {
      this.adaptedEle.appendChild(ele.adaptedEle);
    } else {
      this.adaptedEle.appendChild(ele as any);
    }
    ele.set('parent', this);
    const children = this.getChildren() || [];
    this.set('children', children.concat([ele]));
  }

  /**
   * @param shapeType the shape type, circle, rect, ellipse, polygon, image, marker, path, text, dom
   * @param cfg configurations for the added group
   * @returns the newly added group
   */
  public addShape(param1, param2) {
    let shapeType = isString(param1) ? param1 : param2?.type || 'circle';
    const cfg = param2 ? param2 : param1;
    const { attrs = {} } = cfg || {};
    delete cfg.attrs;
    delete cfg.type;
    const param = {
      style: attrs,
      ...cfg
    };
    // avoid number type text value
    if (param.style?.text) param.style.text = `${param.style.text}`;
    const shape = createShape(shapeType, param, this.getCanvas());
    this.appendChild(shape);
    return shape;
  }

  /**
   * sort the children according to the zIndex
   */
  public sort() {
    // G will sorts the shapes automatically. This empty function is used for avoiding calling error
    return;
  }

  /**
   * get the canvas
   * @returns {ICanvas} the canvas
   */
  public getCanvas(): ICanvas {
    return this.get('canvas');
  }

  /**
   * get the parent group or canvas
   * @returns {IContainer} the parent group or canvas
   */
  public getParent(): IContainer {
    return this.get('parent');
  }

  /**
   * get the children groups or shapes of the group
   * @returns {IElement[]} children groups or shapes
   */
  public getChildren(): IElement[] {
    return this.children || [];
  }

  /**
   * get the first child in the group
   * @returns {IElement} child group or shape
   */
  public getFirst(): IElement {
    return this.getChildren()[0];
  }

  /**
   * get the last child in the group
   * @returns {IElement} child group or shape
   */
  public getLast(): IElement {
    const children = this.getChildren();
    return children[children.length - 1];
  }

  /**
   * get the number of the children of the group
   * @returns {number} number of the children
   */
  public getCount(): number {
    return this.getChildren().length;
  }

  /**
   * get the child group or shape according to the index
   * @param {number} index
   * @returns {IElement} child group or shape
   */
  public getChildByIndex(index: number): IElement {
    return this.getChildren()[index];
  }

  /**
   * whether the group contains the element
   * @param {IElement} group or shape
   * @returns {boolean} contains or not
   */
  public contain(element: IElement): boolean {
    const children = this.getChildren();
    return children.indexOf(element) > -1;
  }

  /**
   * remove the child group or shape from the group
   * @param {IElement} element group or shape
   * @param {boolean} destroy whether destroy the element in the same time
   */
  public removeChild(element: IElement, destroy: boolean = true) {
    const children = this.getChildren() || [];
    const index = children.indexOf(element);
    if (index > -1) {
      children.splice(index, 1);
    }
    element.remove(destroy);
  }

  /**
   * find a child according to the fun
   * @param  {ElementFilterFn} fn matching function
   * @return {Element | null} the matched child element
   */
  public find(fn: ElementFilterFn): IElement | null {
    let rst: IElement = null;
    const children = this.getChildren();
    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      if (fn(element)) rst = element;
      else if (element instanceof Group) rst = element.find(fn);
      if (rst) break;
    }
    return rst;
  }

  /**
   * find a child by id
   * @param  {string} id id of the child shape or group
   * @return {Element | null} the matched child element
   */
  public findById(id: string): IElement | null {
    return this.find((element) => {
      return element.get('id') === id;
    });
  }

  /**
   * find a child by className or name
   * @param  {string} name name of the child shape or group
   * @return {Element | null} the matched child element
   */
  public findByClassName(name: string) {
    return this.find((element) => {
      return element.get('name') === name || element.get('className') === name;
    });
  }

  /**
   * find all the matched child according to the fun
   * @param  {ElementFilterFn} fn matching function
   * @return {Element | null} the matched child element
   */
  public findAll(fn: ElementFilterFn): IElement[] {
    const children = this.getChildren();
    let rst: IElement[] = [];
    children.forEach(child => {
      if (fn(child)) {
        rst.push(child);
      } else if (child instanceof Group) {
        rst = rst.concat(child.findAll(fn) || []);
      }
    });
    return rst;
  }

  /**
   * find all the matched child by name
   * @param  {string} name the name of the child shape or group
   * @return {Element | null} the matched child element
   */
  public findAllByName(name: string) {
    return this.findAll((element) => {
      return element.get('name') === name;
    });
  }

  /**
   * the matrix of the group
   * @returns {number[]} the matrix 
   */
  public getMatrix() {
    const matrix = this.adaptedEle.getLocalMatrix() || unitMatrix;
    return Array.from(matrix);
  }

  /**
   * apply matrix the group, same as setMatrix
   * @param {number[]} newMatrix 
   */
  public applyMatrix(newMatrix) {
    this.adaptedEle.setLocalMatrix(newMatrix);
  }

  /**
   * apply matrix the group
   * @param {number[]} newMatrix 
   */
  public setMatrix(newMatrix: number[]) {
    this.adaptedEle.setLocalMatrix(new Float32Array(newMatrix));
  }

  /**
   * reset matrix to the unit matrix
   */
  public resetMatrix() {
    this.adaptedEle.setLocalMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  /** TODO: 待实现 */
  public applyToMatrix(vector: number[]) { }

  /** TODO: 待实现 */
  public invertFromMatrix(vector: number[]) { }

  /**
   * translate the group 
   * @param {number} x the relative horizontal distance from current x
   * @param {number} y the relative vertical distance from current y
   * @return {IElement} group
   */
  public translate(x: number = 0, y: number = 0): IElement {
    this.adaptedEle.translate(x, y);
    return this;
  }

  /**
   * move the group to a target x and y
   * @param {number} toX the target x
   * @param {number} toY the target y
   * @return {IElement} group
   */
  public move(toX: number = 0, toY: number = 0): IElement {
    const matrix = this.getMatrix();
    const x = this.attr('x') || matrix[6] || 0;
    const y = this.attr('y') || matrix[7] || 0;
    this.adaptedEle.translate(toX - x, toY - y);
    return this;
  }

  /**
   * move the group to a target x and y
   * @param {number} toX the target x
   * @param {number} toY the target y
   * @return {IElement} group
   */
  public moveTo(toX: number = 0, toY: number = 0): IElement {
    return this.move(toX, toY);
  }

  /**
   * scale the group
   * @param {number} ratioX ratio for horizontal
   * @param {number} ratioY ratio for vertical
   * @param {Point} center the scaling center, { x: 0, y: 0 } by default
   * @return {IElement} group
   */
  public scale(ratioX: number, ratioY?: number, center: Point = { x: 0, y: 0 }): IElement {
    this.adaptedEle.setOrigin(center.x, center.y)
    this.adaptedEle.scaleLocal(ratioX, ratioY || ratioX)
    return this;
  }

  /**
   * rotate the group at (0, 0)
   * @param {number} radian the radian of the rotation
   * @return {IElement} group
   */
  public rotate(radian: number): IElement {
    this.adaptedEle.setOrigin(0, 0)
    this.adaptedEle.rotateLocal(radian / Math.PI * 180);
    return this;
  }

  /**
   * rotate the group at (0, 0)
   * @param {number} radian the radian of the rotation
   * @return {IElement} group
   */
  public rotateAtStart(radian: number): IElement {
    this.adaptedEle.setOrigin(0, 0)
    this.adaptedEle.rotateLocal(radian / Math.PI * 180);
    return this;
  }

  /**
   * rotate the group at (x, y)
   * @param {number} x the rotate center x
   * @param {number} y the rotate center y
   * @param {number} radian the radian of the rotation
   * @return {IElement} group
   */
  public rotateAtPoint(x: number, y: number, radian: number): IElement {
    this.adaptedEle.setOrigin(x, y);
    this.adaptedEle.rotateLocal(radian / Math.PI * 180)
    return this;
  }

  /**
   * set a clip for the group
   * @param {ClipCfg} clipCfg the clip configurations
   * @return {IShape} group
   */
  public setClip(clipCfg: ClipCfg): IShape {
    const clipShape = createShape(
      clipCfg.type,
      { style: clipCfg.attrs },
      this.getCanvas()
    );
    this.set('clipShape', clipShape);
    this.adaptedEle.setClip(clipShape as any);
    return clipShape
  }

  /**
   * get the clip shape of the group
   * @return {IShape} group
   */
  public getClip() {
    return this.get('clipShape');
  }

  /**
   * get the global bounding box of the group
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
   * get the local bounding box of the group
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
   * set animate for the group
   * 1. animate(toAttrs: ElementAttrs, duration: number, easing?: string, callback?: () => void, delay?: number)
   * 2. animate(onFrame: OnFrame, duration: number, easing?: string, callback?: () => void, delay?: number)
   * 3. animate(toAttrs: ElementAttrs, cfg: AnimateCfg)
   * 4. animate(onFrame: OnFrame, cfg: AnimateCfg)
   * @param param1 toAttrs or onFrame
   * @param param2 duration or animateCfg
   * @param param3 ...args other configures
   */
  public animate(...args) {
    // @ts-ignore
    const callAnimate = (...args) => this.adaptedEle.animate(...args);
    processAnimate(args, this, callAnimate);
    return callAnimate;
  }

  /**
   * stop all the animations on the group. the animations will be executed to the end
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
   * resume all the paused animation on the group
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
   * pause all the animation on the group
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
   * destroy and remove all the sub shapes
   */
  public clear() {
    this.adaptedEle.removeChildren();
    this.set('children', []);
  }

  /**
   * bind listener to canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   * @param once only listen once
   */
  public on(eventname: string, callback: Function, once?: boolean) {
    this.adaptedEle.addEventListener(eventname, callback as any, { once });
    return this;
  }

  /**
   * remove listener from the group
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   */
  public off(eventname: string, callback: Function) {
    this.adaptedEle.removeEventListener(eventname, callback as any);
    return this;
  }

  /**
   * bind once listener to canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   */
  public once(eventname: string, callback: Function) {
    this.adaptedEle.addEventListener(eventname, callback as any, { once: true });
    return this;
  }

  /**
   * emit a event to the group
   * @param eventname the name of the event, e.g. 'click'
   * @param event the event object param for listener
   */
  public emit(eventname: string, event: object) {
    const eventnames = eventname.split(':');
    const name = eventnames[1] || eventname;
    if (EVENTS.includes(name as typeof EVENTS[number])) {
      this.emit(eventname, event);
    } else {
      // 除内置事件外的其他事件，为自定义事件，需要使用 CustomEvent 并将参数放入 detail
      const gEvent = new CustomEvent(eventname, { detail: event });
      this.adaptedEle.dispatchEvent(gEvent);
    }
    return this;
  }

  /**
   * clone the group and its succeeds groups and shapes
   * @return {IGroup} the cloned group
   */
  public clone(): IGroup {
    const { className, id } = this.cfg;
    const tree = new Group({
      className: `cloned-${className}`,
      id: `cloned-${id || ''}`
    });

    // this.createEle({ ...this.cfg, attrs: this.attrs, children: [], parent: null });
    const stack = [[this, tree]];
    const setMatrixStack = [];
    while (stack.length) {
      const [origin, parent] = stack.pop();
      origin.getChildren().forEach((child) => {
        let ele;
        if (child instanceof Group) {
          ele = new Group({ id: child.cfg.id }); // , attrs: child.attr()
        } else {
          ele = createShape((child as IShape).shapeType, { style: child.attr() }, this.getCanvas());
        }
        // const ele = this.createEle({ ...child.cfg, attrs: child.attrs, children: [] });
        const matrix = child.getMatrix();
        setMatrixStack.push({ ele, matrix });
        parent.appendChild(ele);
        stack.push([child, ele]);
      });
    }
    // 需要先设置外层 group 矩阵，再设置内层。避免出现矩阵叠加效果
    setMatrixStack.reverse();
    while (setMatrixStack.length) {
      const { ele, matrix } = setMatrixStack.pop();
      ele.setMatrix(matrix);
    }
    const groupMatrix = this.getMatrix();
    tree.setMatrix(groupMatrix);
    return tree;
  }

  /**
   * whether the element is a canvas, always returns false
   * @return {boolean} it is a canvas or not
   */
  public isCanvas() {
    return false;
  }

  /**
   * whether the element is a group, always returns true
   * @return {boolean} it is a group or not
   */
  public isGroup() {
    return true;
  }

  /**
   * get function
   * @param {string} key the key of the properties of group
   * @returns {any} the value of the properties of group with key
   */
  public get(key) {
    switch (key) {
      case 'children':
        return this.children;
      case 'capture':
        return this.adaptedEle.interactive;
      case 'visible':
        return this.adaptedEle.attributes.visibility === 'visible';
      case 'zIndex':
        return this.adaptedEle.style.zIndex;
      default:
        return this.adaptedEle.get(key);
    }
  }

  /**
   * set function
   * @param {string} key the key of the properties of group
   * @param {any} value the value of the property with key
   */
  public set(name, value) {
    this.adaptedEle.set(name, value);
    switch (name) {
      case 'children':
        this.children = value;
        break;
      case 'capture':
        this.adaptedEle.interactive = value;
        break;
      case 'visible':
        if (value) this.show();
        else this.hide();
        break;
      case 'zIndex':
        this.adaptedEle.style[name] = value;
        break;
    }
    this.cfg[name] = value;
  }

  /**
   * show the group
   */
  public show() {
    this.adaptedEle.show();
  }

  /**
   * hide the group
   */
  public hide() {
    this.adaptedEle.hide();
  }

  /**
   * set zIndex for group and sort the parent group automatically
   */
  public setZIndex(zIndex: number) {
    this.adaptedEle.style.zIndex = zIndex;
  }

  /**
   * front the group
   */
  public toFront() {
    this.adaptedEle.toFront();
  }

  /**
   * back the group
   */
  public toBack() {
    this.adaptedEle.toBack();
  }

  /**
   * get or set the attributes for the group
   * @param {string|ShapeAttrs} param1 the key of the attribute to get or set, or a ShapeAttrs to set all the attributes in param1
   * @param {any} param2 set the value for the key param1 if param1 is a string
   */
  public attr(param1: string | ShapeAttrs, param2?: any): any | void {
    return attr(param1, param2, this);
  }

  /**
   * remove the group from its parent group
   */
  public remove(destroy = true) {
    this.adaptedEle.remove(destroy);
    const siblings = this.get('parent').getChildren() || [];
    const idx = siblings.indexOf(this);
    if (idx > -1) {
      siblings.splice(siblings.indexOf(this), 1);
    }
    if (destroy) {
      this.destroy();
    }
  }

  /**
   * whether the animation is paused
   * @return {boolean} is paused
   */
  public isAnimatePaused(): boolean {
    return this.isPaused;
  }

  /**
   * destroy the canvas
   */
  public destroy() {
    if (this.adaptedEle && !this.adaptedEle.destroyed) this.adaptedEle.destroy();
    this.destroyed = true;
    this.set('destroyed', true);
    this.set('children', []);
  }
}