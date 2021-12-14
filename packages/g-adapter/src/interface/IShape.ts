import { DisplayObject as GShape, Animation } from '@antv/g'
import { IBBox } from '../types';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#Z8ZDU

// ● 继承新 G 所有内容
// ● getMatrix  同 Group
// ● setMatrix/applyMatrix  同 Group
// ● getBBox  同 Group
// ● getCanvasBBox  同 Group
// ● animate  同 Group

// Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text 这些图形都继承上述内容
// 看情况是否要全部改写，需要的话建一个文件夹包裹所有 shape 相关文件

// @ts-ignore
export default interface IShape extends GShape {

  matrix: number[];
  
  getMatrix: () => number[];

  setMatrix: (newMatrix: number[]) => void;

  applyMatrix: (newMatrix: number[]) => void;

  /**
   * get the global bounding box of the shape
   * @returns bbox
   */
  getCanvasBBox: () => IBBox;

  /**
   * get the local bounding box of the shape
   * @returns bbox
   */
  getBBox: () => IBBox;

  // TODO: types
  animate: (frameCfg: any, animateCfg: any) => Animation | null;
  // (keyframes: Keyframe[] | PropertyIndexedKeyframes | null, options?: number | KeyframeAnimationOptions | undefined): Animation | null;

  clone: () => IShape;
}