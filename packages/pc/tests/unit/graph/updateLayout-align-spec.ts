import { Graph } from '../../../src';
import { numberEqual } from '../layout/util';

const div = document.createElement('div');
div.id = 'global-spec';
document.body.appendChild(div);

describe('graph', () => {
  const graph = new Graph({
    container: div,
    width: 500,
    height: 500,
    layout: {
      type: 'circular',
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas'],
    },
  });
  const data = {
    nodes: [
      {
        id: 'node1',
        label: 'node1',
      },
      {
        id: 'node2',
        label: 'node2',
      },
      {
        id: 'node3',
        label: 'node3',
      },
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
      },
      {
        source: 'node2',
        target: 'node3',
      },
      {
        source: 'node3',
        target: 'node1',
      },
    ],
  };
  graph.data(data);
  graph.render();
  // graph.translate(100, 200);
  it.only('grid align begin', (done) => {
    graph.once('afterlayout', (e) => {
      setTimeout(() => {
        const bbox = graph.getGroup().getCanvasBBox();
        const leftTopPoint = [bbox.minX, bbox.minY];
        const leftTopCanvas = graph.getCanvasByPoint(...leftTopPoint);
        expect(leftTopCanvas.x).toBe(0);
        expect(leftTopCanvas.y).toBe(0);
        done();
      }, 50);
    });
    graph.updateLayout(
      {
        type: 'grid',
      },
      'begin',
    );
  });
  it.only('dagre align center', (done) => {
    graph.once('afterlayout', (e) => {
      setTimeout(() => {
        const bbox = graph.getGroup().getCanvasBBox();
        const centerPoint = [(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2];
        const centerCanvas = graph.getCanvasByPoint(...centerPoint);
        expect(numberEqual(centerCanvas.x, 250)).toBe(true);
        expect(numberEqual(centerCanvas.y, 250)).toBe(true);
        done();
      }, 50);
    });
    graph.updateLayout(
      {
        type: 'dagre',
      },
      'center',
    );
  });
  it.only('force align center', (done) => {
    setTimeout(() => {
      const bbox = graph.getGroup().getCanvasBBox();
      const graphCenterPoint = [(bbox.minX + bbox.maxX) / 2, (bbox.minY + bbox.maxY) / 2];
      const canvasPos = graph.getCanvasByPoint(...graphCenterPoint);
      expect(numberEqual(canvasPos.x, 100, 10)).toBe(true);
      expect(numberEqual(canvasPos.y, 200, 10)).toBe(true);
      done();
    }, 2000);
    graph.updateLayout(
      {
        type: 'force',
      },
      'center',
      { x: 100, y: 200 },
    );
  });
});
