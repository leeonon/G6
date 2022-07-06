// import { IGroup, IShape } from '@antv/g-base';
import { IGroup, IShape } from '@antv/g6-g-adapter';
import Shape from '../shape';
import { NodeConfig, Item } from '../../types';
import Global from '../../global';

/**
 * 基本的图片，可以添加文本，默认文本在图片的下面
 */
Shape.registerNode(
  'image',
  {
    options: {
      img: 'https://gw.alipayobjects.com/mdn/rms_f8c6a0/afts/img/A*eD7nT6tmYgAAAAAAAAAAAABkARQnAQ',
      size: 200,
      labelCfg: {
        style: {
          fontFamily: Global.windowFontFamily
        },
      },
      clipCfg: {
        show: false,
        type: 'circle',
        // circle
        r: 50,
        // ellipse
        rx: 50,
        ry: 35,
        // rect
        width: 50,
        height: 35,
        // polygon
        points: [
          [30, 12],
          [12, 30],
          [30, 48],
          [48, 30],
        ],
        // path
        path: [
          ['M', 25, 25],
          ['L', 50, 25],
          ['A', 12.5, 12.5, 0, 1, 1, 50, 50],
          ['A', 12.5, 12.5, 0, 1, 0, 50, 50],
          ['L', 25, 75],
          ['Z'],
        ],
        // 坐标
        x: 0,
        y: 0,
        // clip 的属性样式
        // style: {
        //   lineWidth: 1
        // },
      },
    },
    shapeType: 'image',
    labelPosition: 'bottom',
    drawShape(cfg: NodeConfig, group: IGroup): IShape {
      const { shapeType } = this;
      const style = this.getShapeStyle!(cfg);
      delete style.fill;
      const shape = group.addShape(shapeType, {
        attrs: style,
        className: `${this.type}-keyShape`,
        name: `${this.type}-keyShape`,
        draggable: true,
      });
      (this as any).drawClip(cfg, shape);
      return shape;
    },
    drawClip(cfg: NodeConfig, shape: IShape) {
      const { clipCfg: clip } = this.mergeStyle || this.getOptions(cfg);

      if (!clip.show) {
        return;
      }
      // 支持 circle、rect、ellipse、Polygon 及自定义 path clip
      const { type, x: clipCfgX, y: clipCfgY, style } = clip;
      // G 5.0 中，clip 作为 shape 的一个子图形，坐标是相对于 shape 的。因此需要对齐到 shape 的中心
      const x = clipCfgX + shape.attr('width') / 2;
      const y = clipCfgY + shape.attr('height') / 2;
      if (type === 'circle') {
        const { r } = clip;
        shape.setClip({
          type: 'circle',
          attrs: {
            r,
            x,
            y,
            ...style,
          },
        });
      } else if (type === 'rect') {
        const { width, height } = clip;
        const rectX = x - width / 2;
        const rectY = y - height / 2;
        shape.setClip({
          type: 'rect',
          attrs: {
            x: rectX,
            y: rectY,
            width,
            height,
            ...style,
          },
        });
      } else if (type === 'ellipse') {
        const { rx, ry } = clip;
        shape.setClip({
          type: 'ellipse',
          attrs: {
            x,
            y,
            rx,
            ry,
            ...style,
          },
        });
      } else if (type === 'polygon') {
        const { points } = clip;
        shape.setClip({
          type: 'polygon',
          attrs: {
            points,
            ...style,
          },
        });
      } else if (type === 'path') {
        const { path } = clip;
        shape.setClip({
          type: 'path',
          attrs: {
            path,
            ...style,
          },
        });
      }
    },
    getShapeStyle(cfg: NodeConfig) {
      const { style: defaultStyle, img } = this.mergeStyle || this.getOptions(cfg);
      const size = this.getSize!(cfg);
      let width = size[0];
      let height = size[1];
      if (defaultStyle) {
        width = defaultStyle.width || size[0];
        height = defaultStyle.height || size[1];
      }
      const style = {
        x: -width / 2, // 节点的位置在上层确定，所以这里仅使用相对位置即可
        y: -height / 2,
        width,
        height,
        img,
        ...defaultStyle,
      };
      return style;
    },
    updateShapeStyle(cfg: NodeConfig, item: Item) {
      const group = item.getContainer();
      const shapeClassName = `${this.itemType}-shape`;
      const shape = group['shapeMap'][shapeClassName] ||
        group.find((element) => element.get('className') === shapeClassName) || item.getKeyShape();
      const shapeStyle = this.getShapeStyle!(cfg);
      if (shape && !shape.destroyed) {
        shape.attr(shapeStyle);
      }
    },
  },
  'single-node',
);
