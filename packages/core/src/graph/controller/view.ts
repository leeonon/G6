// import { AbstractCanvas, Point, IGroup } from '@antv/g-base';
import { ICanvas, Point, IGroup } from '@antv/g-adapter';
import { isNumber, isString } from '@antv/util';
import { Item, Matrix, Padding, GraphAnimateConfig, IEdge, FitViewRules } from '../../types';
import { formatPadding } from '../../util/base';
import { IAbstractGraph } from '../../interface/graph';

export default class ViewController {
  private graph: IAbstractGraph;

  public destroyed: boolean = false;

  constructor(graph: IAbstractGraph) {
    this.graph = graph;
    this.destroyed = false;
  }

  // get view center coordinate
  private getViewCenter(): Point {
    const padding = this.getFormatPadding();
    const { graph } = this;
    const width: number = graph.get('width') || 0;
    const height: number = graph.get('height') || 0;
    return {
      x: (width - padding[1] - padding[3]) / 2 + padding[3],
      y: (height - padding[0] - padding[2]) / 2 + padding[0],
    };
  }

  public fitCenter(animate?: boolean, animateCfg?: GraphAnimateConfig) {
    const { graph } = this;
    const group: IGroup = graph.get('group');
    const bbox = group.getCanvasBBox();
    if (!bbox) return;
    const bboxWidth = bbox.maxX - bbox.minX;
    const bboxHeight = bbox.maxY - bbox.minY;
    if (bboxWidth === 0 || bboxHeight === 0) return;
    const groupCenter: Point = {
      x: (bbox.maxX + bbox.minX) / 2,
      y: (bbox.maxY + bbox.minY) / 2
    }
    this.focusPoint(groupCenter, animate, animateCfg);
  }

  // fit view graph
  public fitView(animate?: boolean, animateCfg?: GraphAnimateConfig) {
    const { graph } = this;
    const padding = this.getFormatPadding();
    const width: number = graph.get('width');
    const height: number = graph.get('height');
    const group: IGroup = graph.get('group');
    const bbox = group.getCanvasBBox();

    if (!bbox || bbox.width === 0 || bbox.height === 0) return;
    const viewCenter = this.getViewCenter();
    const viewCenterPoint = graph.getPointByCanvas(viewCenter.x, viewCenter.y);

    const groupCenter: Point = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2,
    };

    const bboxWidth = bbox.maxX - bbox.minX
    const bboxHeight = bbox.maxY - bbox.minY;
    const viewLeftTop = [padding[3], padding[0]];
    const viewRightBottom = [width - padding[1], height - padding[2]];
    const viewLeftTopToGlobal = graph.getPointByCanvas(viewLeftTop[0], viewLeftTop[1]);
    const viewRightBottomToGlobal = graph.getPointByCanvas(viewRightBottom[0], viewRightBottom[1]);

    const targetWidth = viewRightBottomToGlobal.x - viewLeftTopToGlobal.x;
    const targetHeight = viewRightBottomToGlobal.y - viewLeftTopToGlobal.y;
    const ratio = Math.min(targetWidth / bboxWidth, targetHeight / bboxHeight);


    let animateConfig = animateCfg;
    if (animate) {
      animateConfig = {
        ...(animateCfg || {
          duration: 500,
          easing: 'easeCubic'
        }),
        callback: () => {
          const zoomCenter = graph.get('canvas').getCamera().getPosition();
          graph.zoom(ratio, { x: zoomCenter[0], y: zoomCenter[1] }, true, animateCfg);
          animateCfg?.callback?.();
        }
      }
    }

    graph.translate(viewCenterPoint.x - groupCenter.x, viewCenterPoint.y - groupCenter.y, animate, animateConfig);
    const zoomCenter = graph.get('canvas').getCamera().getPosition();
    if (!animate && !graph.zoom(ratio, { x: zoomCenter[0], y: zoomCenter[1] })) {
      console.warn('zoom failed, ratio out of range, ratio: %f', ratio);
    }
  }

  // fit view graph by rule
  public fitViewByRules(rules: FitViewRules, animate?: boolean, animateCfg?: GraphAnimateConfig) {
    const {
      onlyOutOfViewPort = false,
      direction = 'both',
      ratioRule = 'min'
    } = rules;
    const { graph } = this;
    const padding = this.getFormatPadding();
    const width: number = graph.get('width');
    const height: number = graph.get('height');
    const group: IGroup = graph.get('group');
    const bbox = group.getCanvasBBox();

    if (bbox.width === 0 || bbox.height === 0) return;
    const viewCenter = this.getViewCenter();
    const centerPoint = graph.get('canvas').getPointByCanvas(viewCenter.x, viewCenter.y);

    this.fitCenter(animate, animateCfg);

    const currentZoom = graph.getZoom();
    const wRatio = (width - padding[1] - padding[3]) / (bbox.width * currentZoom);
    const hRatio = (height - padding[0] - padding[2]) / (bbox.height * currentZoom);
    let ratio;
    if (direction === 'x') {
      ratio = wRatio;
    } else if (direction === 'y') {
      ratio = hRatio;
    } else {
      // ratioRule
      ratio = ratioRule === 'max' ? Math.max(wRatio, hRatio) : Math.min(wRatio, hRatio);
    }
    // 如果设置了仅对超出视口宽高的场景进行fitview，则没超出的场景zoom取1
    if (onlyOutOfViewPort) {
      ratio = ratio < 1 ? ratio : 1;
    }

    let endZoom = currentZoom * ratio;
    const minZoom = graph.get('minZoom');
    // 如果zoom小于最小zoom, 则以最小zoom为准
    if (endZoom < minZoom) {
      endZoom = minZoom;
      console.warn('fitview failed, ratio out of range, ratio: %f', ratio, 'graph minzoom has been used instead');
    }
    graph.zoomTo(endZoom, centerPoint, animate, animateCfg);
  }

  public getFormatPadding(): number[] {
    const padding = this.graph.get('fitViewPadding') as Padding;
    return formatPadding(padding);
  }

  public focusPoint(point: Point, animate?: boolean, animateCfg?: GraphAnimateConfig) {
    const viewCenter = this.getViewCenter();
    const modelCenter = this.getPointByCanvas(viewCenter.x, viewCenter.y);

    this.graph.translate(
      (modelCenter.x - point.x),
      (modelCenter.y - point.y),
      animate,
      animateCfg
    );
  }

  /**
   * 将 Canvas 坐标转成绘制坐标
   * @param canvasX canvas x 坐标
   * @param canvasY canvas y 坐标
   */
  public getPointByCanvas(canvasX: number, canvasY: number): Point {
    return this.graph.get('canvas').getPointByCanvas(canvasX, canvasY);
  }

  /**
   * 将绘制坐标转成 Canvas 坐标
   * @param x 视口 x 坐标
   * @param y 视口 y 坐标
   */
  public getCanvasByPoint(x: number, y: number): Point {
    return this.graph.get('canvas').getCanvasByPoint(x, y);
  }

  /**
   * 将页面坐标转成视口坐标
   * @param clientX 页面 x 坐标
   * @param clientY 页面 y 坐标
   */
  public getPointByClient(clientX: number, clientY: number): Point {
    const canvas: ICanvas = this.graph.get('canvas');
    return canvas.getPointByClient(clientX, clientY);
  }

  /**
   * 将视口坐标转成页面坐标
   * @param x 视口 x 坐标
   * @param y 视口 y 坐标
   */
  public getClientByPoint(x: number, y: number): Point {
    const canvas: ICanvas = this.graph.get('canvas');
    const canvasPoint = this.getCanvasByPoint(x, y);
    const point = canvas.getClientByPoint(canvasPoint.x, canvasPoint.y);

    return { x: point.x, y: point.y };
  }


  /**
   * 将元素移动到画布中心
   * @param item Item 实例或 id
   * @param {boolean} animate 是否带有动画地移动
   * @param {GraphAnimateConfig} animateCfg 若带有动画，动画的配置项
   */
  public focus(item: string | Item, animate?: boolean, animateCfg?: GraphAnimateConfig) {
    if (isString(item)) {
      item = this.graph.findById(item);
    }

    if (item) {
      let x = 0,
        y = 0;
      if (item.getType && item.getType() === 'edge') {
        const sourceMatrix: IGroup = (item as IEdge).getSource().get('group').getMatrix();
        const targetMatrix: IGroup = (item as IEdge).getTarget().get('group').getMatrix();
        if (sourceMatrix && targetMatrix) {
          x = (sourceMatrix[6] + targetMatrix[6]) / 2;
          y = (sourceMatrix[7] + targetMatrix[7]) / 2;
        } else if (sourceMatrix || targetMatrix) {
          x = sourceMatrix ? sourceMatrix[6] : targetMatrix[6];
          y = sourceMatrix ? sourceMatrix[7] : targetMatrix[7];
        }
      } else {
        const group: IGroup = item.get('group');
        const matrix: Matrix = group.getMatrix() || [1, 0, 0, 0, 1, 0, 0, 0, 1];
        x = matrix[6];
        y = matrix[7];
      }
      // 用实际位置而不是model中的x,y,防止由于拖拽等的交互导致model的x,y并不是当前的x,y
      this.focusPoint({ x, y }, animate, animateCfg);
    }
  }

  /**
   * 改变 canvas 画布的宽度和高度
   * @param width canvas 宽度
   * @param height canvas 高度
   */
  public changeSize(width: number, height: number) {
    const { graph } = this;
    if (!isNumber(width) || !isNumber(height)) {
      throw Error('invalid canvas width & height, please make sure width & height type is number');
    }

    graph.set({ width, height });
    const canvas: ICanvas = graph.get('canvas');
    canvas.changeSize(width, height);

    // change the size of grid plugin if it exists on graph
    const plugins = graph.get('plugins');
    plugins.forEach((plugin) => {
      if (plugin.get('gridContainer')) {
        // 网格定位信息初始化
        plugin.positionInit();
      }
    });
  }

  public destroy() {
    (this.graph as IAbstractGraph | null) = null;
    this.destroyed = false;
  }
}
