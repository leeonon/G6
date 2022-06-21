// import { Canvas as GCanvas } from '@antv/g';
// import { Renderer as CanvasRenderer } from '@antv/g-canvas';
import { Canvas } from '@antv/g6-g-adapter';
import { AbstractGraph } from '../../src';

export default class Graph extends AbstractGraph {
  constructor(cfg) {
    super(cfg);
  }

  initEventController() { }

  initLayoutController() { }

  initCanvas() {
    let container: string | HTMLElement | Element | null = this.get('container');
    if (typeof container === 'string') {
      container = document.getElementById(container);
      this.set('container', container);
    }

    if (!container) {
      throw new Error('invalid container');
    }

    const { clientWidth, clientHeight } = container;

    const width: number = this.get('width') || clientWidth;
    const height: number = this.get('height') || clientHeight;

    const canvasCfg: any = {
      container,
      width,
      height,
      renderer: this.cfg.renderer || 'canvas'
    };
    const pixelRatio = this.get('pixelRatio');
    if (pixelRatio) {
      canvasCfg.pixelRatio = pixelRatio;
    }

    const canvas = new Canvas(canvasCfg);

    this.set('canvas', canvas);
  }
  initPlugins() { }
}
