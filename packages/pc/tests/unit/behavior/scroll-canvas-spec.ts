import '../../../src';
import { Graph } from '../../../src';
import { G6GraphEvent } from '@antv/g6-core';

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
div.id = 'scroll-spec';
document.body.appendChild(div);

class G6Event extends G6GraphEvent {
  wheelDelta: number;
  preventDefault = () => { }
  defaultPrevented: boolean = false;
}
function createWheelEvent(delta, deltaX, deltaY) {

  const e = new G6Event('wheel', {});
  e.deltaX = deltaX;
  e.deltaY = deltaY;
  e.wheelDelta = delta;
  return e;
}

function approximateEqual(a, b, threshold = 0.02) {
  return Math.abs(a - b) < threshold;
}

describe('scroll-canvas', () => {
  it('scroll canvas', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'scroll-canvas',
          },
        ],
      },
    });
    graph.data(data);
    graph.render();
    const oriCenter = graph.getPointByCanvas(250, 250);
    const e = createWheelEvent(100, 100, 100);
    graph.emit('wheel', e);
    let afterCenter = graph.getPointByCanvas(250, 250);
    expect(afterCenter.x - oriCenter.x).toBe(100);
    expect(afterCenter.y - oriCenter.y).toBe(100);
    graph.emit('wheel', e);
    afterCenter = graph.getPointByCanvas(250, 250);
    expect(afterCenter.x - oriCenter.x).toBe(200);
    expect(afterCenter.y - oriCenter.y).toBe(200);
    graph.destroy();
  });
  it('direction x', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'scroll-canvas',
            direction: 'x'
          },
        ],
      },
    });
    graph.data(data);
    graph.render();
    const oriCenter = graph.getPointByCanvas(250, 250);
    const e = createWheelEvent(100, 100, 100);
    graph.emit('wheel', e);
    let afterCenter = graph.getPointByCanvas(250, 250);
    expect(afterCenter.x - oriCenter.x).toBe(100);
    expect(afterCenter.y - oriCenter.y).toBe(0);
    graph.emit('wheel', e);
    afterCenter = graph.getPointByCanvas(250, 250);
    expect(afterCenter.x - oriCenter.x).toBe(200);
    expect(afterCenter.y - oriCenter.y).toBe(0);
    graph.destroy();
  });
  it('direction y', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      modes: {
        default: [
          {
            type: 'scroll-canvas',
            direction: 'y'
          },
        ],
      },
    });
    graph.data(data);
    graph.render();
    const oriCenter = graph.getPointByCanvas(250, 250);
    const e = createWheelEvent(100, 100, 100);
    graph.emit('wheel', e);
    let afterCenter = graph.getPointByCanvas(250, 250);
    expect(afterCenter.x - oriCenter.x).toBe(0);
    expect(afterCenter.y - oriCenter.y).toBe(100);
    graph.emit('wheel', e);
    afterCenter = graph.getPointByCanvas(250, 250);
    expect(afterCenter.x - oriCenter.x).toBe(0);
    expect(afterCenter.y - oriCenter.y).toBe(200);
    graph.destroy();
  });
});
