import { Group as GGroup, Circle } from '@antv/g';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#vJTCy

export default abstract class Group extends GGroup {

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
     * TODO: add a shape to the canvas
     * @param cfg configurations for the added group
     * @returns the newly added group
     */
    public addShape(shapeType, cfg) {
      let shape;
      switch(shapeType) {
        case 'circle':
            // TODO
            break;
        case 'rect':
          // TODO
          break;
        // more cases
        default:
          shape = new Circle(cfg);
      }
      this.appendChild(shape);
      return shape;
    }

    /**
     * TODO: sort the children according to the zIndex
     */
    public sort() {}

    /**
     * TODO: find the children according to the function
     */
    public find(func) {
      return this.children.find(child => func(child));
    }

    /**
     * TODO: find the children according to the function
     */
    public findAll(func) {
      return this.children.filter(child => func(child));
    }

    /**
     * TODO: find the children according to the function
     */
    public findById(id: string) {
      return this.children.find(child => child.get('id') === id);
    }

    /**
     * TODO: find the children according to the function
     */
    public findAllByName(name: string) {
      return this.children.filter(child => child.get('name') === name);
    }
    
    public getMatrix() {
      return this.matrix;
    }
  
    public setMatrix(newMatrix) {
      // TODO：如何根据 newMatrix 设定转换为 setOrigin、rotateLocal、translate/setPosition
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
        x: aabb.center[0],
        y: aabb.center[1]
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
        x: aabb.center[0],
        y: aabb.center[1]
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
      // ???
      return { ...this };
    }

    public isCanvas() {
      return false;
    }
  }