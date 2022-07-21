// import { Event as GraphEvent, ICanvas } from '@antv/g-base';
import { ICanvas, GEvent } from '@antv/g-adapter';
import { clone } from '@antv/util';
import { G6Event, IG6GraphEvent, IShapeBase, Item, BehaviorOption } from '../types';
import { IAbstractGraph } from './graph';

export interface IBehavior {
  registerBehavior: (type: string, behavior: BehaviorOption) => void;
  hasBehavior: (type: string) => boolean;
  getBehavior: (type: string) => any;
}

export interface IBehaviorOption {
  type: string;
  getEvents: () => {
    [key in G6Event]?: string;
  };
  updateCfg: (cfg: object) => {};
  getDefaultCfg?: () => object;
  shouldBegin?: (e?: IG6GraphEvent) => boolean;
  shouldUpdate?: (e?: IG6GraphEvent) => boolean;
  shouldEnd?: (e?: IG6GraphEvent) => boolean;
  bind?: (e: IAbstractGraph) => void;
  unbind?: (e: IAbstractGraph) => void;
}

export class G6GraphEvent implements IG6GraphEvent { //  extends GraphEvent
  public item: Item;

  public canvasX: number;

  public canvasY: number;

  public clientX: number;

  public clientY: number;

  public x: number;

  public y: number;

  public pointX: number;

  public pointY: number;

  public wheelDelta: number;

  public detail: number;

  public target!: IShapeBase & ICanvas;

  [key: string]: unknown;

  constructor(type: string, event: IG6GraphEvent) {
    Object.keys(event).forEach(key => {
      this[key] = event[key];
    })

    // this.item = event.item;
    // this.canvasX = event.canvasX;
    // this.canvasY = event.canvasY;
    // this.wheelDelta = event.wheelDelta;
    // this.detail = event.detail;
  }
}
