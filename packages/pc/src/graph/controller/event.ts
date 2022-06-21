import { addEventListener } from '@antv/dom-util';
import { ICanvas, IShape, IElement } from '@antv/g6-g-adapter';
import { each, isNil, wrapBehavior } from '@antv/util';
import { AbstractEvent, IG6GraphEvent, G6GraphEvent, Item, Util, EVENTS } from '@antv/g6-core';
import Graph from '../graph';

const { cloneEvent } = Util;

type Fun = () => void;

const cloneEventFromG = (e: any, eventName: string): IG6GraphEvent => {
  const event = new G6GraphEvent(eventName, e);
  event.target = e.target;
  event.currentTarget = e.currentTarget;
  event.type = eventName;
  event.name = eventName;

  /**
   * (clientX, clientY): 相对于页面的坐标；
   * (canvasX, canvasY): 相对于 <canvas> 左上角的坐标；
   * (x, y): 相对于整个画布的坐标, 与 model 的 x, y 是同一维度的。
   */

  const canvasXY = e.canvas || { x: e.canvasX, y: e.canvasY };
  const viewportXY = e.viewport || { x: e.viewportX, y: e.viewportY };
  const clientXY = e.client || { x: e.clientX, y: e.clientY };

  // 绘制坐标
  event.pointX = canvasXY.x;
  event.pointY = canvasXY.y;
  event.x = canvasXY.x;
  event.y = canvasXY.y;
  // canvas dom 坐标
  event.canvasX = viewportXY.x;
  event.canvasY = viewportXY.y;
  // 浏览器坐标
  event.clientX = clientXY.x;
  event.clientY = clientXY.y;

  event.wheelDelta = e.deltaY;
  event.originalEvent = e.originalEvent;
  event.gEvent = e;
  event.preventDefault = eventName === 'wheel' ? () => { } : e.preventDefault;
  event.stopPropagation = e.stopPropagation;
  event.stopImmediatePropagation = e.stopImmediatePropagation;

  // event.bubbles = true;
  return event;
};

const getPointerName = (evtName: string) => {
  if (!evtName.includes('mouse')) return evtName;
  return evtName.replace('mouse', 'pointer');
}

export default class EventController extends AbstractEvent {
  protected extendEvents: any[] = [];

  protected canvasHandler!: Fun;

  protected mousedown: boolean = false;

  protected preItem: Item | null = null;

  protected preShape: IElement = null;

  public destroyed: boolean;

  constructor(graph: Graph) {
    super(graph);
  }

  // 初始化 G6 中的事件
  protected initEvents() {
    const { graph, extendEvents = [] } = this;

    const canvas: ICanvas = graph.get('canvas');
    const el = canvas.get('el');

    const canvasHandler: Fun = wrapBehavior(this, 'onCanvasEvents') as Fun;
    const originHandler = wrapBehavior(this, 'onExtendEvents');
    const wheelHandler = wrapBehavior(this, 'onWheelEvent');

    // each(EVENTS, event => {
    //   canvas.off(event).on(event, canvasHandler);
    // });

    canvas.off('*');
    EVENTS.forEach(eventName => {
      const pointerName = getPointerName(eventName);
      canvas.on(pointerName, evt => this.onCanvasEvents(evt, eventName));
    });

    this.canvasHandler = canvasHandler;
    extendEvents.push(addEventListener(el, 'DOMMouseScroll', wheelHandler));
    extendEvents.push(addEventListener(el, 'mousewheel', wheelHandler));

    if (typeof window !== 'undefined') {
      extendEvents.push(addEventListener(window as any, 'keydown', originHandler));
      extendEvents.push(addEventListener(window as any, 'keyup', originHandler));
      extendEvents.push(addEventListener(window as any, 'focus', originHandler));
      extendEvents.push(addEventListener(window as any, 'blur', originHandler));
      extendEvents.push(addEventListener(window as any, 'mouseup', originHandler));
    }
  }

  // 获取 shape 的根图形
  private static getItemRoot<T extends IShape>(shape: any): T {
    while (shape && shape.get && !shape.get('item')) {
      shape = shape.get('parent') || shape.parentNode;
    }
    return shape;
  }

  /**
   * 处理 canvas 事件
   * @param evt 事件句柄
   */
  protected onCanvasEvents(gEvt: IG6GraphEvent, eventTypeProp?: string) {
    const { graph } = this;
    let eventType = eventTypeProp;
    if (eventType === 'click') {
      eventType = gEvt.detail === 2 ? 'dblclick' : 'click';
    } else if (eventType === 'rightup') {
      eventType = 'contextmenu';
    }
    const evt = cloneEventFromG(gEvt, eventType);

    const canvas = graph.get('canvas');

    evt.currentTarget = graph;

    // 代表点击到 canvas 上，需要将 evt 的 target 替换为 g-adapter 的canvas
    if (gEvt.target.nodeName === 'document') {
      if (eventType === 'mousemove' || eventType === 'mouseleave') {
        this.handleMouseMove(evt, 'canvas');
      }
      evt.target = canvas;
      evt.item = null;

      graph.emit(eventType, evt);
      graph.emit(`canvas:${eventType}`, evt);

      return;
    }

    const itemShape: IShape = EventController.getItemRoot(evt.target);
    if (!itemShape) {
      graph.emit(eventType, evt);
      return;
    }

    const item = itemShape.get?.('item');
    if (!item || item.destroyed) {
      return;
    }

    const type = item.getType();

    // 事件target是触发事件的Shape实例，item是触发事件的item实例
    evt.item = item;
    if (evt.canvasX === evt.x && evt.canvasY === evt.y) {
      const canvasPoint = graph.getCanvasByPoint(evt.x, evt.y);
      evt.canvasX = canvasPoint.x;
      evt.canvasY = canvasPoint.y;
    }

    graph.emit(eventType, evt); // click
    if (type) graph.emit(`${type}:${eventType}`, evt); // node:click
    const targetShapeName = evt.target.get('name');
    if (targetShapeName) graph.emit(`${targetShapeName}:${eventType}`, evt); // text-shape:click

    if (eventType === 'mousemove') {
      this.handleMouseMove(evt, type);
    }
  }

  /**
   * 处理扩展事件
   * @param evt 事件句柄
   */
  protected onExtendEvents(evt: IG6GraphEvent) {
    if (evt.type === 'mouseup') {
      if (evt.target !== this.graph.get('canvas')?.get('el')) {
        this.graph.emit(evt.type, evt);
        this.clearCache();
      }
      return;
    }
    this.graph.emit(evt.type, evt);
  }

  /**
   * 处理滚轮事件
   * @param evt 事件句柄
   */
  protected onWheelEvent(evt: IG6GraphEvent) {
    if (isNil(evt.wheelDelta)) {
      evt.wheelDelta = -evt.detail;
    }
    this.graph.emit('wheel', evt);
  }

  /**
   * 处理鼠标移动的事件
   * @param evt 事件句柄
   * @param type item 类型
   */
  private handleMouseMove(evt: IG6GraphEvent, type: string) {
    const { graph, preItem, preShape } = this;
    const canvas: ICanvas = graph.get('canvas');
    const item = (evt.target as any) === canvas ? null : evt.item;

    evt = cloneEvent(evt) as IG6GraphEvent;

    if (preItem !== item) {
      // 从前一个item直接移动到当前item，触发前一个item的leave事件
      if (preItem && !preItem.destroyed) {
        evt.item = preItem;
        this.emitCustomEvent(preItem.getType(), 'mouseleave', evt);
      }

      // 从一个item或canvas移动到当前item，触发当前item的enter事件
      if (item && !item.destroyed) {
        evt.item = item;
        this.emitCustomEvent(type, 'mouseenter', evt);
      }
    }


    this.preItem = item;

    // 图形的 mouseenter 与 mouseleave
    const shape = evt.target;
    if (preShape !== shape) {
      if (preShape && !preShape.destroyed && preShape.nodeName !== 'document') {
        const preItemShape: IShape = EventController.getItemRoot(preShape);
        const preItem = preItemShape?.get('item');
        const preShapeName = preShape.get('name');
        preShapeName && graph.emit(`${preShapeName}:mouseleave`, {
          ...evt,
          item: preItem,
          target: preShape
        });
      }
      const name = shape.get?.('name');
      name && graph.emit(`${name}:mouseenter`, evt);
    }
    if (shape.nodeName !== 'document') this.preShape = shape;
  }

  /**
   * 在 graph 上面 emit 事件
   * @param itemType item 类型
   * @param eventType 事件类型
   * @param evt 事件句柄
   */
  private emitCustomEvent(itemType: string | undefined, eventType: string, evt: IG6GraphEvent) {
    evt.type = eventType;
    const eventName = itemType ? `${itemType}:${eventType}` : eventType;
    this.graph.emit(eventName, evt);
  }

  private clearCache() {
    this.mousedown = false;
    this.preItem = null;
    this.preShape = null;
  }

  public destroy() {
    const { graph, canvasHandler, extendEvents } = this;
    const canvas: ICanvas = graph.get('canvas');

    canvas.off('*', canvasHandler);

    each(extendEvents, (event) => {
      event.remove();
    });

    this.clearCache();
    this.extendEvents.length = 0;
    (this.canvasHandler as Fun | null) = null;
    this.destroyed = true;
  }
}
