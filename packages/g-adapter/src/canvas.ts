import { Canvas as GCanvas } from '@antv/g';
import Group from './group';

// https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#u0T2w


// ● 继承新 G 所有内容
// ● addGroup  同 Group
// ● get('el')
// canvas.get(‘el’) -> canvas.getContextService().getDomElement()
// ● destroyed
// canvas.destoyed: true | false
// ● on
// on -> addEventListener
// ● isCanvas()
// !!target.document
// ● clone
// 深拷贝一份

export default class Canvas extends GCanvas {

  public destroyed: boolean = this.document?.destroyed || false;

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
    console.log('addGroup ', group);
    this.appendChild(group);
    return group;
  }

  /**
   * get function
   * @param key the key of the properties of canvas
   * @returns the value of the properties of canvas with key. if the key is 'el', returns the DOM node of the canvas
   */
  public get(key) {
    if (key === 'el') {
      return this.getContextService()?.getDomElement?.()
    }
    return this.document?.[key];
  }

  /**
   * bind listener to canvas
   * @param eventname the name of the event, e.g. 'click'
   * @param callback the listener function for the event
   */
  public on(eventname, callback) {
    this.addEventListener(eventname, callback);
  }

  /**
   * if the object is a canvas
   * @returns return true to distinguish from shape and group
   */
  public isCanvas() {
    return true;
  }
  
  /**
   * destroy the canvas
   */
  public destroy() {
    this.destroyed = true;
    super.destroy();
  }
}