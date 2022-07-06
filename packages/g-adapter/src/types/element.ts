import { Group as GGroup, DisplayObject as GShape } from '@antv/g';

export type ElementCfg = {
  /**
   * 元素 id,可以为空
   * @type {String}
   */
  id?: string;
  /**
   * 元素 name, 可以为空
   * @type {String}
   */
  name?: string;
  /**
   * 元素 className, 可以为空
   * @type {String}
   */
  className?: string;
  /**
   * 层次索引，决定绘制的先后顺序
   * @type {Number}
   */
  zIndex?: number;
  /**
   * 是否可见
   * @type {Boolean}
   */
  visible?: boolean;
  /**
   * 是否可以拾取
   * @type {Boolean}
   */
  capture?: boolean;
  /**
   * 元素类型
   * @type {string}
   */
  type?: string;

  adaptedEle?: GGroup | GShape;
}

export type ElementFilterFn = (IElement) => boolean;