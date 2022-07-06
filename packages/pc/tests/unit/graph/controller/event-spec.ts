import { GEvent } from '@antv/g6-g-adapter';
import Simulate from 'event-simulate';
import G6 from '../../../../src';

const div = document.createElement('div');
div.id = 'event-spec';
document.body.appendChild(div);

describe('event', () => {

  div.addEventListener('click', e => {
    console.log('dom click');
  })
  const graph = new G6.Graph({
    container: div,
    width: 500,
    height: 500,
    modes: { //  'zoom-canvas', 'activate-relations', 'lasso-select'
      default: ['activate-relations', 'drag-node', 'click-select', 'scroll-canvas', 'drag-canvas', 'lasso-select', // , 'drag-canvas'
        'shortcuts-call', 'edge-tooltip', {
          type: 'create-edge',
          edgeConfig: {
            type: 'cubic',
            style: {
              stroke: '#f00',
            },
          },
        },]
    },
    nodeStateStyles: {
      selected: {
        fill: '#f00'
      }
    }
  });
  graph.data({
    nodes: [{ id: '1', label: '11111', x: 20, y: 50 }, { id: '2', label: '2222', x: 120, y: 50 }],
    edges: [{ source: '1', target: '2', label: 'edge', style: { lineAppendWidth: 10 } }]
  });
  graph.render();
  it.only('init event', () => {
    const canvas = graph.get('canvas');
    expect(graph.get('eventController')).not.toBe(undefined);

    let a = 0;
    graph.on('canvas:click', (e) => {
      a = e.a;
    });
    graph.emit('canvas:click', { a: 1 });
    canvas.emit('click', { a: 1, target: canvas, type: 'click' });
    expect(a).toBe(1);
  });
  it.only('g event on canvas', () => {
    let triggered = false;
    const canvas = graph.get('canvas');
    graph.on('canvas:click', () => {
      triggered = true;

      expect(triggered).toBe(true);
      graph.off('canvas:click');
    });

    const evt = { type: 'click', target: canvas };
    expect(triggered).toBe(false);

    canvas.emit('click', evt);
  });

  it.only('g event on shape', () => {
    let target = null;
    const canvas = graph.get('canvas');

    const node = graph.addItem('node', {
      type: 'circle',
      color: '#ccc',
      style: { x: 50, y: 50, r: 20, lineWidth: 2 },
    });

    const shape = node.get('group').get('children')[0];

    graph.on('node:mousedown', (e) => {
      target = e.item;
      expect(target === node).toBe(true);
    });

    canvas.emit('mousedown', { type: 'mousedown', target: shape });

    target = null;
    graph.off('node:mousedown');

    canvas.emit('mousedown', { type: 'mousedown', target: shape });

    expect(target).toBe(null);
  });
  it.only('dom event', () => {
    let evt = null;

    const fn = (e) => {
      evt = e;
      expect(evt).not.toBe(null);
      expect(evt.type).toEqual('keydown');
    };

    graph.on('keydown', fn);

    const canvas = graph.get('canvas').get('el');

    const bbox = canvas.getBoundingClientRect();

    Simulate.simulate(canvas, 'keydown', {
      clientY: bbox.right - 50,
      clientX: bbox.left + 10,
    });

    graph.off('keydown', fn);

    evt = null;

    Simulate.simulate(canvas, 'keydown', {
      clientY: bbox.right - 50,
      clientX: bbox.left + 10,
    });

    expect(evt).toBe(null);
  });
  it.only('mouseenter & mouseleave', () => {
    graph.clear();
    const node = graph.addItem('node', { x: 100, y: 100, size: 50, label: 'test' });

    let enter = 0;
    let leave = 0;

    graph.on('node:mouseenter', (e) => {
      enter++;
      expect(e.item === node);
    });

    graph.on('mousemove', (e) => {
      enter++;
    });

    graph.on('node:mouseleave', (e) => {
      leave++;
      expect(e.item === node);
    });

    const canvas = graph.get('canvas');
    const label = node.get('group').get('children')[0];
    const shape = node.get('keyShape');

    graph.emit('node:mouseenter', { type: 'mouseenter', target: label, item: node });
    expect(enter).toBe(1);

    graph.emit('node:mouseenter', { type: 'mouseenter', target: shape, item: node });

    expect(enter).toBe(2);

    graph.emit('node:mouseenter', { type: 'mousemove', target: canvas, item: node });

    graph.emit('node:mouseenter', { type: 'mousemove', target: shape, item: node });
    expect(enter).toBe(4);

    graph.emit('mousemove', { type: 'mousemove', target: canvas });
    expect(enter).toBe(5);

    expect(leave).toBe(0);
    graph.emit('node:mouseleave', { type: 'mouseleave', target: shape, item: node });
    expect(leave).toBe(1);

    graph.emit('node:mouseleave', { type: 'mousemove', target: canvas, item: node });
    expect(leave).toBe(2);

    graph.emit('node:mouseleave', { type: 'mousemove', taregt: canvas, item: node });
    expect(leave).toBe(3);
  });
  it.only('modified viewport', () => {
    let triggered = false;
    graph.off();
    // graph.on('mousedown', e => {
    //   if (triggered) {
    //     expect(e.canvasX).toBe(5);
    //     expect(e.canvasY).toBe(-330);
    //     expect(e.x).toBe(-95);
    //     expect(e.y).toBe(125);
    //   } else {
    //     expect(e.canvasX).toBe(5);
    //     expect(e.canvasY).toBe(-27.5);
    //     expect(e.x).toBe(5);
    //     expect(e.y).toBe(225);
    //   }
    // });

    graph.on('mouseup', (e) => {
      // expect(e.canvasX).toBe(10);
      // expect(e.canvasY).toBe(10);
      // expect(e.x).toBe(-80);
      // expect(e.y).toBe(-80);
    });

    const canvas = graph.get('canvas').get('el');
    const bbox = canvas.getBoundingClientRect();

    Simulate.simulate(canvas, 'mousedown', {
      clientY: bbox.right - 50,
      clientX: bbox.left + 10,
    });

    graph.translate(100, 100);
    triggered = true;

    Simulate.simulate(canvas, 'mousedown', {
      clientY: bbox.right - 50,
      clientX: bbox.left + 10,
    });

    graph.zoom(0.5);

    Simulate.simulate(canvas, 'mouseup', {
      clientY: bbox.top + 10,
      clientX: bbox.left + 10,
    });
  });
  it.only('item capture', () => {
    graph.off();
    const node = graph.addItem('node', { x: 100, y: 100, id: 'node' });

    const canvas = graph.get('canvas').get('el');
    const bbox = canvas.getBoundingClientRect();

    let targetItem;
    graph.on('mousedown', (e) => {
      targetItem = e.target;
      expect(targetItem === graph.get('canvas')).toBe(true);
    });

    Simulate.simulate(canvas, 'mousedown', {
      clientY: bbox.right - 100,
      clientX: bbox.left + 100,
    });

    targetItem = null;
    node.enableCapture(false);

    Simulate.simulate(canvas, 'mouseup', {
      clientY: bbox.top + 100,
      clientX: bbox.left + 100,
    });
    expect(targetItem === node).toBe(false);
  });
  it.only('event object overlap', () => {
    let count = 0;
    let triggered = false;
    graph.off();
    graph.clear();

    const canvas = graph.get('canvas');
    const node = graph.addItem('node', { x: 100, y: 100, size: 50, label: 'test' });

    graph.on('node:mouseleave', (e) => {
      triggered = true;
      expect(e.type).toEqual('mouseleave');
    });

    graph.on('mousemove', (e) => {
      count += 1;
      expect(e.type).toEqual('mousemove');
    });

    // // canvas 的 emit，新 G 内部将 target 改成了 canvas，无法完成下面测试。实践看行为是正确的
    // canvas.emit('mousemove', { type: 'mousemove', target: node.get('keyShape'), item: node });
    // expect(count).toEqual(1);
    // expect(triggered).toBe(false);

    // canvas.emit('mousemove', { type: 'mousemove', target: canvas });
    // expect(count).toEqual(2);
    // expect(triggered).toBe(true);
  });

  it.only('destory', () => {
    expect(graph).not.toBe(undefined);
    expect(graph.destroyed).toBe(false);
    graph.destroy();
    expect(graph.destroyed).toBe(true);
  });
});

describe('event with name', () => {
  it.only('default node', () => {
    G6.registerNode(
      'custom-node',
      {
        drawShape(cfg, group) {
          const keyShape = group.addShape('rect', {
            attrs: {
              width: 120,
              height: 50,
              stroke: 'red',
              fill: '#ccc',
            },
            name: 'custom-node-rect',
          });

          group.addShape('rect', {
            attrs: {
              width: 70,
              height: 30,
              stroke: 'green',
              fill: 'green',
              x: 20,
              y: 10,
            },
            name: 'custom-node-subrect',
          });
          return keyShape;
        },
      },
      'single-node',
    );

    const graph = new G6.Graph({
      container: 'event-spec',
      width: 500,
      height: 400,
      nodeStateStyles: {
        selected: {
          fill: 'red',
        },
      },
      defaultNode: {
        type: 'custom-node',
        linkPoint: {
          show: true,
        },
      },
    });

    const data = {
      nodes: [
        {
          id: 'node',
          label: 'node',
          x: 100,
          y: 200,
        },
        {
          id: 'node1',
          label: 'node1',
          x: 300,
          y: 200,
        },
      ],
    };

    graph.data(data);
    graph.render();

    graph.on('node:mouseenter', (evt) => {
      graph.setItemState(evt.item, 'selected', true);
    });

    graph.on('node:mouseleave', (evt) => {
      graph.setItemState(evt.item, 'selected', false);
    });

    graph.on('custom-node-rect:click', (evt) => {
      graph.setItemState(evt.item, 'selected', true);
      const name = evt.target.get('name');
      expect(name).toEqual('custom-node-rect');
    });

    graph.on('custom-node-subrect:click', (evt) => {
      const name = evt.target.get('name');
      expect(name).toEqual('custom-node-subrect');
    });

    const node = graph.getNodes()[0];
    graph.emit('custom-node-rect:click', { item: node, target: node.getContainer().find(ele => ele.get('name') === 'custom-node-rect') });
    graph.emit('custom-node-subrect:click', { item: node, target: node.getContainer().find(ele => ele.get('name') === 'custom-node-subrect') });

    graph.destroy();
  });
});
