import { DisplayObject as GShape } from '@antv/g';
import { Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text } from '@antv/g';

// 内容见 https://yuque.antfin-inc.com/shiwu.wyy/go1ec6/ghv1we#Z8ZDU

// ● 继承新 G 所有内容
// ● getMatrix  同 Group
// ● setMatrix/applyMatrix  同 Group
// ● getBBox  同 Group
// ● getCanvasBBox  同 Group
// ● animate  同 Group

// Rect, Circle, Ellipse, Polygon, Path, Image, Line, Text 这些图形都继承上述内容
// 看情况是否要全部改写，需要的话建一个文件夹包裹所有 shape 相关文件
export default abstract class Shape extends GShape {

  public matrix: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

  constructor(cfg) {
    super(cfg);
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
}