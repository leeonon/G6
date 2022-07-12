import '../../../src';
import { Graph } from '../../../src';
import { G6GraphEvent } from '@antv/g6-core';
import { numberEqual } from '../layout/util';

const data = {
  nodes: [
    { id: 'node1', label: 'node1' },
    { id: 'node2', label: 'node2' },
    { id: 'node3', label: 'node3' },
    { id: 'node4', label: 'node4' },
    { id: 'node5', label: 'node5' },
  ],
  edges: [
    { source: 'node1', target: 'node2' },
    { source: 'node1', target: 'node3' },
    { source: 'node1', target: 'node4' },
    { source: 'node4', target: 'node2' },
    { source: 'node5', target: 'node2' },
  ],
};

const div = document.createElement('div');
div.id = 'zoom-spec';
document.body.appendChild(div);

class G6Event extends G6GraphEvent {
  wheelDelta: number;
  preventDefault = () => { }
  defaultPrevented: boolean = false;
}
function createWheelEvent(canvas, delta, x, y) {
  const bbox = canvas.getBoundingClientRect();
  const e = new G6Event('wheel', {});
  e.clientX = bbox.left + x;
  e.clientY = bbox.top + y;
  e.wheelDelta = delta;
  return e;
}

function approximateEqual(a, b, threshold = 0.02) {
  return Math.abs(a - b) < threshold;
}

describe('zoom-canvas', () => {
  it('zoom canvas', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            // enableOptimize: true,
          },
        ],
      },
    });
    graph.data(data);
    graph.render();
    const e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', e);
    const ratio = 1.1111111111111112;
    expect(graph.getZoom()).toBe(ratio)
    graph.emit('wheel', e);
    expect(graph.getZoom()).toBe(ratio * ratio)
    graph.destroy();
  });
  it('event not prevented', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            shouldUpdate: (e) => {
              expect(e.defaultPrevented).toBe(false);
              return false;
            },
          },
        ],
      },
    });
    const e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', e);
    graph.destroy();
  });
  it('prevent update', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            shouldUpdate: (e) => {
              expect(e).not.toBe(undefined);
              return false;
            },
          },
        ],
      },
    });
    const e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', e);
    let matrix = graph.get('group').getMatrix();
    expect(matrix[0]).toBe(1);
    expect(matrix[1]).toBe(0);
    expect(matrix[4]).toBe(1);
    graph.destroy();
  });
  it('max zoom & min zoom', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            maxZoom: 5,
            minZoom: 4.2,
          },
        ],
      },
    });
    graph.zoom(4.8);
    let e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', e);
    expect(graph.getZoom()).toBe(5);
    graph.zoom(0.1);
    e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', e);
    expect(graph.getZoom()).toBe(4.2);
    graph.destroy();
  });
  it('unbind zoom', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: ['zoom-canvas'],
        custom: [],
      },
    });
    const e = createWheelEvent(graph.get('canvas').get('el'), -100, 100, 100);
    graph.emit('wheel', e);
    expect(graph.getZoom()).toBe(0.9);
    graph.setMode('custom');
    graph.emit('wheel', e);
    expect(graph.getZoom()).toBe(0.9);
  });

  it('zoom with optimize', (done) => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            enableOptimize: true,
          },
        ],
      },
    });

    const data = {
      nodes: [
        {
          id: 'node1',
          x: 100,
          y: 100,
          label: 'label',
        },
        {
          id: 'node2',
          x: 100,
          y: 200,
          label: 'label2',
        },
      ],
      edges: [
        {
          source: 'node1',
          target: 'node2',
          label: 'edge',
        },
      ],
    };

    graph.data(data);
    graph.render();

    let e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', e);
    const ratio = 1.1111111111111112;
    expect(graph.getZoom()).toBe(ratio);

    // 默认 zoom=1，会显示所有元素
    setTimeout(() => {
      let node1 = graph.findById('node1');
      let container = node1.getContainer();
      container.get('children').map((child) => {
        expect(child.get('visible')).toBe(true);
      });

      graph.zoom(0.5);
      e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
      graph.emit('wheel', e);

      // 只显示 keyShape
      node1 = graph.findById('node1');
      container = node1.getContainer();
      expect(node1.getKeyShape().get('visible')).toBe(true);
      container.get('children').map((child) => {
        if (!child.get('isKeyShape')) {
          expect(child.get('visible')).toBe(false);
        }
      });
      graph.zoomTo(1);
      e = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
      graph.emit('wheel', e);
      setTimeout(() => {
        node1 = graph.findById('node1');
        container = node1.getContainer();
        container.get('children').map((child) => {
          expect(child.get('visible')).toBe(true);
        });
        graph.destroy();
        done();
      }, 550);
    }, 550);
  });
  it('zoom and fix items with fixAll', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            fixSelectedItems: {
              fixAll: true,
            },
          },
          'drag-node',
        ],
      },
      defaultNode: { size: 100, style: { lineWidth: 0 } },
      nodeStateStyles: {
        selected: {
          fill: '#f00',
        },
      },
      edgeStateStyles: {
        selected: {
          stroke: '#f00',
        },
      },
    });

    const data = {
      nodes: [
        {
          id: 'node1',
          x: 100,
          y: 100,
          label: 'label',
        },
        {
          id: 'node2',
          x: 100,
          y: 100,
          label: 'label2',
        },
      ],
      edges: [
        {
          source: 'node1',
          target: 'node2',
          label: 'edge',
        },
      ],
    };

    graph.data(data);
    graph.render();

    const node = graph.getNodes()[1];
    const shapeGroup = node.getContainer();
    let matrix = shapeGroup.getMatrix();
    graph.setItemState(node, 'selected', true);
    const edge = graph.getEdges()[0];
    graph.setItemState(edge, 'selected', true);

    let pe = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', pe);
    expect(matrix[0]).toBe(1);
    expect(matrix[4]).toBe(1);
    let ne = createWheelEvent(graph.get('canvas').get('el'), -100, 100, 100);
    graph.emit('wheel', ne);
    graph.emit('wheel', ne);
    matrix = shapeGroup.getMatrix();
    expect(numberEqual(matrix[0], 1.11, 0.002)).toBe(true);
    expect(numberEqual(matrix[4], 1.11, 0.002)).toBe(true);
    graph.emit('wheel', pe);
    matrix = shapeGroup.getMatrix();
    expect(matrix[0]).toBe(1);
    expect(matrix[4]).toBe(1);

    graph.destroy();
  });
  it('zoom and fix items with fixLabel and fixLineWidth', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'zoom-canvas',
            fixSelectedItems: {
              fixLabel: true,
              fixLineWidth: true,
            },
          },
          'drag-node',
        ],
      },
      nodeStateStyles: {
        selected: {
          fill: '#f00',
        },
      },
      edgeStateStyles: {
        selected: {
          stroke: '#f00',
        },
      },
    });

    const data = {
      nodes: [
        {
          id: 'node1',
          x: 100,
          y: 100,
          label: 'label',
        },
        {
          id: 'node2',
          x: 100,
          y: 200,
          label: 'label2',
        },
      ],
      edges: [
        {
          source: 'node1',
          target: 'node2',
          label: 'edge',
        },
      ],
    };

    graph.data(data);
    graph.render();

    const node = graph.getNodes()[1];
    const shapeGroup = node.getContainer();
    let textShape = shapeGroup.find((e) => e.get('name') === 'text-shape');
    let keyShape = node.getKeyShape();
    graph.setItemState(node, 'selected', true);
    const edge = graph.getEdges()[0];
    graph.setItemState(edge, 'selected', true);

    let pe = createWheelEvent(graph.get('canvas').get('el'), 100, 100, 100);
    graph.emit('wheel', pe);
    expect(textShape.attr('fontSize')).toEqual(12);
    expect(keyShape.attr('lineWidth')).toBe(4);
    let ne = createWheelEvent(graph.get('canvas').get('el'), -100, 100, 100);
    graph.emit('wheel', ne);
    graph.emit('wheel', ne);
    expect(numberEqual(textShape.attr('fontSize'), 13.33, 0.004)).toEqual(true);
    expect(numberEqual(keyShape.attr('lineWidth'), 4.444, 0.002)).toBe(true);
    graph.emit('wheel', pe);
    expect(textShape.attr('fontSize')).toEqual(12);
    expect(keyShape.attr('lineWidth')).toBe(4);

    graph.destroy();
  });
});
