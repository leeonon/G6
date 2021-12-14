import { Group as GGroup, DisplayObject as GShape, Circle } from '@antv/g';
import { isArray, isFunction, isString } from '@antv/util';
import CloneUtil from './utils/clone';
import { CLONE_CFGS, SHAPE_CLASS_MAP, SYMBOL_PATH_FUNC_MAP } from './constants';
import { getPathBySymbol } from './utils/shape';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#vJTCy

export default class Group extends GGroup {

    public matrix: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  
    constructor(cfg) {
      super(cfg);
    }
    
    /**
     * add a group to the canvas
     * @param cfg configurations for the added group
     * @returns the newly added group
     */
    public addGroup(cfg) {
      const group = new Group(cfg);
      this.appendChild(group);
      return group;
    }

    /**
     * @param shapeType the shape type, circle, rect, ellipse, polygon, image, marker, path, text, dom
     * @param cfg configurations for the added group
     * @returns the newly added group
     */
    public addShape(shapeType, cfg) {
      let shape;
      const attrs = cfg.attrs || {};
      delete cfg.attrs;
      const param = {
        style: attrs,
        ...cfg
      };
      // 将 marker 用 path 封装
      if (shapeType === 'marker') {
        const path = getPathBySymbol(attrs);
        if (!path) {
          console.warn('The symbol for the marker shape is invalid!');
          return;
        }
        attrs.path = path;
        delete attrs.symbol;
      }
      const Shape = SHAPE_CLASS_MAP[shapeType] || Circle;
      shape = new Shape(param);
      // TODO: 这里的 shape 要加上 ./shape 中复写的方法们

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

    public getCanvas() {

    }

    /**
     * find the child according to the function
     */
    // public find(func) {
    //   return this.children.find(child => func(child));
    // }

    // /**
    //  * find the children according to the function
    //  */
    // public findAll(func) {
    //   return this.children.filter(child => func(child));
    // }

    /**
     * find the child by id
     */
    public findById(id: string) {
      return this.children.find(child => child.get('id') === id);
    }

    /**
     * find the children by name
     */
    public findAllByName(name: string) {
      return this.children.filter(child => child.get('name') === name);
    }
    
    public applyMatrix(newMatrix) {
      this.setMatrix(newMatrix);
    }
  
    /**
     * get the global bounding box of the shape
     * @returns bbox
     */
    public getCanvasBBox() {
      const aabb = this.getBounds();
      return {
        minX: aabb.min[0],
        maxX: aabb.max[0],
        minY: aabb.min[1],
        maxY: aabb.max[1],
        x: aabb.min[0],
        y: aabb.min[1],
      }
    }
  
    /**
     * get the local bounding box of the shape
     * @returns bbox
     */
    public getBBox() {
      const aabb = this.getLocalBounds();
      return {
        minX: aabb.min[0],
        maxX: aabb.max[0],
        minY: aabb.min[1],
        maxY: aabb.max[1],
        x: aabb.min[0],
        y: aabb.min[1],
      }
    }
  
    public animate(frameCfg, animateCfg) {
      // TODO: 如何根据 onFrame 或者 toAttrs 转换为关键帧写法
      if (typeof frameCfg === 'function') {
        // animate(onFrame, animateCfg)
      } else {
        // animate(toAttrs, animateCfg)
      }
    }
    public stopAnimate() {}
    public resumeAnimate() {}
    public pauseAnimate() {}
    /**
     * destroy and remove all the sub shapes
     */
    public clear() {}

    /**
     * bind listener to canvas
     * @param eventname the name of the event, e.g. 'click'
     * @param callback the listener function for the event
     */
    public on(eventname, callback) {
      this.addEventListener(eventname, callback);
    }

    /**
     * TODO: clone
     */
    public clone() {
      return this.cloneNode(true);
    }

    public isCanvas() {
      return false;
    }

    public get(name) {
      if (name === 'children') return this.childNodes;
      else return super.get(name);
    }
  }