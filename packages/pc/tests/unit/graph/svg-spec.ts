import { Graph, Layout, TreeGraph } from '../../../src';
import G6 from '../../../src';
import '../../../src/behavior';
import Core, { EdgeConfig } from '@antv/g6-core';
import Plugin from '../../../src/plugin';
import { numberEqual } from '../layout/util';

const { scale, translate } = Core.Util;

const div = document.createElement('div');
div.id = 'global-spec';
document.body.appendChild(div);
const div2 = document.createElement('div');
div2.id = 'graph-spec';
document.body.appendChild(div2);

describe('graph', () => {
  let globalGraph = new Graph({
    container: div,
    width: 500,
    height: 500,
    renderer: 'svg',
    modes: {
      default: ['drag-node'],
    },
  });
  const data = {
    nodes: [
      {
        id: 'node1',
        x: 150,
        y: 50,
        label: 'node1',
      },
      {
        id: 'node2',
        x: 200,
        y: 150,
        label: 'node2',
      },
      {
        id: 'node3',
        x: 100,
        y: 150,
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
  globalGraph.data(data);
  globalGraph.render();

  it('invalid container', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Graph({} as any);
    }).toThrowError('invalid container');
  });

  it('new & destroy graph', (done) => {
    const inst = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      modes: {
        default: ['drag-node'],
      },
    });
    const length = div.childNodes.length;

    expect(inst).not.toBe(undefined);
    expect(inst instanceof Graph).toBe(true);
    expect(length === 1).toBe(true);

    expect(inst.get('canvas')).not.toBe(undefined);
    expect(inst.get('group')).not.toBe(undefined);

    expect(inst.get('group').get('className')).toEqual('root-container');
    expect(inst.get('group').get('id').endsWith('-root')).toBe(true);

    setTimeout(() => {
      const children = inst.get('group').get('children');
      expect(children.length).toBe(4);
      expect(children[1].get('className')).toEqual('edge-container');

      const nodes = inst.getNodes();
      expect(nodes).not.toBe(undefined);
      expect(nodes.length).toBe(0);

      const edges = inst.getEdges();
      expect(edges).not.toBe(undefined);
      expect(edges.length).toBe(0);

      const canvas = inst.get('canvas');
      inst.destroy();

      expect(inst.destroyed).toBe(true);
      expect(canvas.destroyed).toBe(true);
      expect(length - div.childNodes.length).toBe(1);
      done()
    });
  });

  it('render with data & toDataURL & downloadImage', () => {
    const inst = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'dagre',
      },
    });

    const data = {
      nodes: [
        {
          id: 'node1',
          label: 'node1',
          x: 100,
          y: 100,
        },
        {
          id: 'node2',
          x: 200,
          y: 140,
        },
        {
          id: 'node3',
          x: 200,
          y: 180,
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
        {
          id: 'edge2',
          source: 'node1',
          target: 'node1',
        },
        {
          id: 'edge3',
          source: 'node2',
          target: 'node2',
        },
      ],
    };

    inst.data(data);
    inst.render();

    const url = inst.toDataURL();
    expect(url).not.toBe(null);

    // close to avoid alert
    // inst.downloadImage('graph-image');
    inst.destroy();
  });

  it('groupByTypes false', () => {
    const inst = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      groupByTypes: false,
      linkCenter: true,
      defaultEdge: {
        color: '#f00'
      }
    });

    const data = {
      nodes: [
        {
          id: 'node1',
          label: 'node1',
          x: 100,
          y: 100,
        },
        {
          id: 'node2',
          x: 200,
          y: 140,
        },
        {
          id: 'node3',
          x: 200,
          y: 180,
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
        {
          id: 'edge2',
          source: 'node1',
          target: 'node1',
        },
        {
          id: 'edge3',
          source: 'node2',
          target: 'node2',
        },
      ],
    };
    inst.data(data);
    inst.render();

    const nodeGroup = inst.get('nodeGroup');
    const edgeGroup = inst.get('edgeGroup');

    expect(nodeGroup).toBe(undefined);
    expect(edgeGroup).toBe(undefined);

    const node = inst.findById('node1');
    const edge = inst.findById('edge1');

    const group1 = node.get('group').getParent();
    const group2 = edge.get('group').getParent();

    expect(group1).toEqual(group2);
    edge.toFront()
    inst.destroy();
  });

  it('translate', () => {
    globalGraph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      modes: {
        default: ['drag-node'],
      },
    });
    const data = {
      nodes: [
        {
          id: 'node1',
          label: 'node1',
          x: 100,
          y: 100,
        },
        {
          id: 'node2',
          x: 200,
          y: 140,
        },
      ],
      edges: [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
      ],
    };
    globalGraph.data(data);
    globalGraph.render();

    const viewcenter = globalGraph.get('canvas').getCamera().getPosition();
    globalGraph.translate(100, 100);
    const viewCenterAfterTranslate = globalGraph.get('canvas').getCamera().getPosition();
    const expectCenter = [viewcenter[0] - 100, viewcenter[1] - 100];
    expect(viewCenterAfterTranslate[0]).toBe(expectCenter[0]);
    expect(viewCenterAfterTranslate[1]).toBe(expectCenter[1]);
  });

  it('moveTo', () => {
    globalGraph.moveTo(10, 10);
    const viewcenter = globalGraph.get('canvas').getCamera().getPosition();
    expect(numberEqual(viewcenter[0], 386, 1)).toBe(true);
    expect(numberEqual(viewcenter[1], 360, 1)).toBe(true);

    // reset
    globalGraph.get('canvas').getCamera().setPosition(250, 250);
    globalGraph.get('canvas').getCamera().setFocalPoint(250, 250);
  });

  it('zoom', () => {
    // 以 node1 为中心放缩
    globalGraph.zoom(3, { x: 150, y: 50 });
    expect(globalGraph.getZoom()).toBe(3);

    const camera = globalGraph.get('canvas').getCamera();
    const viewCenter = globalGraph.get('canvas').getPointByCanvas(250, 250);
    expect(numberEqual(viewCenter.x, 183, 1)).toBe(true);
    expect(numberEqual(viewCenter.y, 116, 1)).toBe(true);

    // reset
    globalGraph.get('canvas').getCamera().setZoom(1);
    globalGraph.get('canvas').getCamera().setPosition(250, 250);
    globalGraph.get('canvas').getCamera().setFocalPoint(250, 250);
  });

  it('minZoom & maxZoom', () => {
    const graph = new Graph({
      container: div2,
      minZoom: 2,
      maxZoom: 5,
      width: 500,
      height: 500,
      renderer: 'svg',
    });

    const data2 = {
      nodes: [
        {
          id: 'node',
        },
      ],
    };

    graph.data(data2);
    graph.render();

    graph.zoom(0.5, { x: 100, y: 100 });
    expect(graph.getZoom()).toBe(1);

    graph.zoom(5.5);
    expect(graph.getZoom()).toBe(1);
    graph.destroy();
  });

  it('zoomTo', () => {
    globalGraph.zoomTo(2);
    expect(globalGraph.getZoom()).toBe(2);
    let viewcenter = globalGraph.get('canvas').getCanvasByPoint(250, 250);
    // 中心坐标扩大两倍
    expect(numberEqual(viewcenter.x, 500)).toBe(true);
    expect(numberEqual(viewcenter.y, 500)).toBe(true);

    globalGraph.zoomTo(1.5, { x: 250, y: 250 });
    viewcenter = globalGraph.get('canvas').getCanvasByPoint(250, 250);
    expect(numberEqual(viewcenter.x, 500)).toBe(true);
    expect(numberEqual(viewcenter.y, 500)).toBe(true);
  });

  it('change size', () => {
    const div2 = document.createElement('div');
    div2.id = 'change-size-spec';
    document.body.appendChild(div2);
    const graph = new Graph({
      container: div2,
      width: 500,
      height: 500,
      renderer: 'svg',
    });

    expect(graph.get('width')).toBe(500);
    expect(graph.get('height')).toBe(500);

    expect(typeof graph.changeSize).toEqual('function');
    graph.changeSize(300, 300);

    expect(graph.get('width')).toBe(300);
    expect(graph.get('height')).toBe(300);

    graph.destroy();
  });

  it('find', () => {
    globalGraph.clear();
    globalGraph.addItem('node', { id: 'node3', x: 50, y: 100, size: 50, className: 'test test2' });
    const item = globalGraph.addItem('node', {
      id: 'node4',
      x: 100,
      y: 100,
      size: 50,
      className: 'test',
    });

    const findNode = globalGraph.find('node', (node: any) => node.get('model').x === 100);

    expect(findNode).not.toBe(undefined);
    expect(findNode).toEqual(item);
  });

  it('findAll', () => {
    globalGraph.clear();
    const node1 = globalGraph.addItem('node', {
      id: 'node5',
      x: 100,
      y: 100,
      size: 50,
      className: 'test test2',
    });
    const node2 = globalGraph.addItem('node', {
      id: 'node6',
      x: 100,
      y: 100,
      size: 50,
      className: 'test',
    });
    const node3 = globalGraph.addItem('node', { id: 'node7', x: 100, y: 100, size: 50 });

    node1.setState('active', true);
    node2.setState('selected', true);
    node3.setState('active', true);

    let nodes = globalGraph.findAllByState('node', 'active');

    expect(nodes.length).toEqual(2);

    expect(nodes[0]).toEqual(node1);
    expect(nodes[1]).toEqual(node3);

    nodes = globalGraph.findAllByState('node', 'selected');
    expect(nodes.length).toEqual(1);
    expect(nodes[0]).toEqual(node2);
  });

  it('refresh positions', () => {
    const data = { id: 'node8', x: 100, y: 50, size: 50, className: 'test test2' };
    const node = globalGraph.addItem('node', data);
    const group = node.get('group');

    expect(group.getMatrix()[6]).toBe(100);
    expect(group.getMatrix()[7]).toBe(50);

    data.x = 50;
    data.y = 100;

    globalGraph.refreshPositions();
    expect(group.getMatrix()[6]).toBe(50);
    expect(group.getMatrix()[7]).toBe(100);
  });

  it('removeItem', () => {
    let removeNode = globalGraph.findById('remove-item');
    expect(removeNode).toBe(undefined);

    const data = { id: 'remove-item', x: 10, y: 50, size: 50, className: 'test test2' };
    const node = globalGraph.addItem('node', data);

    expect(node).not.toBe(undefined);

    globalGraph.removeItem('remove-item');
    removeNode = globalGraph.findById('remove-item');
    expect(removeNode).toBe(undefined);
  });

  it('canvas point & model point convert', () => {
    let point = globalGraph.getPointByCanvas(100, 100);
    expect(point.x).toBe(100);
    expect(point.y).toBe(100);

    globalGraph.translate(100, 100);

    point = globalGraph.getPointByCanvas(100, 100);
    expect(numberEqual(point.x, 0, 0.001)).toBe(true);
    expect(numberEqual(point.y, 0, 0.001)).toBe(true);

    globalGraph.zoom(1.5);

    point = globalGraph.getPointByCanvas(100, 100);
    expect(numberEqual(point.x, 0, 0.001)).toBe(true);
    expect(numberEqual(point.y, 0, 0.001)).toBe(true);
    point = globalGraph.getPointByCanvas(0, 0);
    expect(numberEqual(point.x, -66.7, 0.1)).toBe(true);
    expect(numberEqual(point.y, -66.7, 0.1)).toBe(true);

    // reset
    const camera = globalGraph.get('canvas').getCamera();
    camera.setZoom(1);
    camera.setPosition(250, 250);
    camera.setFocalPoint(250, 250);

    point = globalGraph.getPointByCanvas(100, 100);
    expect(point.x).toBe(100);
    expect(point.y).toBe(100);

    point = globalGraph.getCanvasByPoint(100, 100);
    expect(numberEqual(point.x, 100, 0.001)).toBe(true);
    expect(numberEqual(point.y, 100, 0.001)).toBe(true);

    // reset
    camera.setZoom(1);
    camera.setPosition(250, 250);
    camera.setFocalPoint(250, 250);
  });

  it('client point & model point convert', () => {
    const bbox = globalGraph.get('canvas').get('el').getBoundingClientRect();

    let point = globalGraph.getPointByClient(bbox.left + 100, bbox.top + 100);

    expect(point.x).toBe(100);
    expect(point.y).toBe(100);

    globalGraph.translate(100, 100);

    point = globalGraph.getPointByClient(bbox.left + 100, bbox.top + 100);
    expect(numberEqual(point.x, 0, 0.001)).toBe(true);
    expect(numberEqual(point.y, 0, 0.001)).toBe(true);

    globalGraph.zoom(1.5)
    point = globalGraph.getPointByClient(bbox.left + 100, bbox.top + 100);
    expect(numberEqual(point.x, 0, 0.001)).toBe(true);
    expect(numberEqual(point.y, 0, 0.001)).toBe(true);

    // reset
    const camera = globalGraph.get('canvas').getCamera();
    camera.setZoom(1);
    camera.setPosition(250, 250);
    camera.setFocalPoint(250, 250);

    point = globalGraph.getClientByPoint(100, 100);

    expect(numberEqual(point.x, bbox.left + 100, 0.1)).toBe(true);
    expect(numberEqual(point.y, bbox.top + 100, 0.1)).toBe(true);
  });

  it('clear', () => {
    globalGraph.destroy();
    expect(globalGraph.destroyed).toBe(true);
  });
});

describe('all node link center', () => {
  const div2 = document.createElement('div');
  div2.id = 'div2-spec';
  document.body.appendChild(div2);
  const graph = new Graph({
    container: div2,
    width: 500,
    height: 500,
    linkCenter: true,
    renderer: 'svg',
    nodeStateStyles: {
      a: {
        fill: 'red',
      },
      b: {
        stroke: 'red',
      },
    },
  });

  it('init', () => {
    expect(graph.get('linkCenter')).toBe(true);

    graph.data({
      nodes: [
        {
          id: '1',
          x: 10,
          y: 10,
        },
        {
          id: '2',
          x: 100,
          y: 100,
        },
      ],
      edges: [{ id: 'e1', source: '1', target: '2' }],
    });
    graph.render();

    const edge = graph.findById('e1');
    expect(edge.get('keyShape').attr('path')).toEqual([
      ['M', 10, 10],
      ['L', 100, 100],
    ]);
  });

  it('loop', () => {
    graph.set('linkCenter', false);

    const node = graph.addItem('node', {
      id: 'circleNode',
      x: 150,
      y: 150,
      style: { fill: 'yellow' },
      anchorPoints: [
        [0, 0],
        [0, 1],
      ],
    });

    const edge1 = graph.addItem('edge', {
      id: 'edge',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'top',
        dist: 60,
        clockwise: true,
      },
      style: { endArrow: true },
    });

    const edge2 = graph.addItem('edge', {
      id: 'edge1',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'top-left',
        dist: 60,
        clockwise: false,
      },
      style: { endArrow: true },
    });

    const edge3 = graph.addItem('edge', {
      id: 'edge2',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'top-right',
        dist: 60,
      },
      style: { endArrow: true },
    });

    const edge4 = graph.addItem('edge', {
      id: 'edge4',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'right',
        dist: 60,
        clockwise: true,
      },
      style: { endArrow: true },
    });

    const edgeWithAnchor = graph.addItem('edge', {
      id: 'edge5',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      sourceAnchor: 0,
      targetAnchor: 1,
      loopCfg: {
        position: 'bottom-right',
        dist: 60,
        clockwise: true,
      },
      style: { endArrow: true },
    });

    graph.addItem('edge', {
      id: 'edge6',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'bottom',
        dist: 60,
        clockwise: true,
      },
      style: { endArrow: true },
    });

    graph.addItem('edge', {
      id: 'edge7',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'bottom-left',
        dist: 60,
        clockwise: true,
      },
      style: { endArrow: true },
    });

    graph.addItem('edge', {
      id: 'edge8',
      source: 'circleNode',
      target: 'circleNode',
      type: 'loop',
      loopCfg: {
        position: 'left',
        dist: 60,
        clockwise: true,
      },
      style: { endArrow: true },
    });

    const edgeShape = edge1.getKeyShape().attr('path');
    const edge2Shape = edge2.getKeyShape().attr('path');

    expect(edge2Shape[0][1]).toEqual(edgeShape[0][1]);
    expect(edge2Shape[0][2]).toEqual(edgeShape[0][2]);
    expect(edge3.getKeyShape().attr('path')[1][0]).toEqual('C');
    expect(edge3.getKeyShape().attr('path')[0][1]).toEqual(edgeShape[1][5]);
    expect(edge4.getKeyShape().attr('path')[0][1]).toEqual(edge3.getKeyShape().attr('path')[1][5]);
    expect(edge4.getKeyShape().attr('path')[0][2]).toEqual(edge3.getKeyShape().attr('path')[1][6]);

    const pathWithAnchor = edgeWithAnchor.getKeyShape().attr('path');
    expect(pathWithAnchor[0][1]).toEqual(140);
    expect(pathWithAnchor[0][2]).toEqual(140);
    expect(pathWithAnchor[1][0]).toEqual('C');
    expect(pathWithAnchor[1][5]).toEqual(140);
    expect(pathWithAnchor[1][6]).toEqual(160);
  });

  it('clear states', () => {
    graph.clear();
    const node = graph.addItem('node', { id: 'a', x: 50, y: 100, size: 50 });

    graph.setItemState(node, 'a', true);
    graph.setItemState(node, 'b', true);

    expect(graph.findAllByState('node', 'a').length).toBe(1);
    graph.clearItemStates(node, ['a', 'b']);

    expect(graph.findAllByState('node', 'a').length).toBe(0);
    expect(graph.findAllByState('node', 'b').length).toBe(0);

    graph.setItemState(node, 'a', true);
    graph.setItemState(node, 'b', true);

    graph.clearItemStates('a', ['a']);
    expect(graph.findAllByState('node', 'a').length).toBe(0);
    expect(graph.findAllByState('node', 'b').length).toBe(1);

    graph.clearItemStates(node, 'b');
    expect(graph.findAllByState('node', 'b').length).toBe(0);

    graph.destroy();
  });

  it('default node & edge style', () => {
    const div3 = document.createElement('div');
    div3.id = 'div3-spec';
    document.body.appendChild(div3);
    const defaultGraph = new Graph({
      container: div3,
      width: 500,
      height: 500,
      renderer: 'svg',
      defaultNode: {
        style: {
          fill: 'red',
          stroke: 'blue',
        },
      },
      nodeStateStyles: {
        default: {
          fill: 'red',
          stroke: 'blue',
        },
        selected: {
          fill: 'green',
          stroke: 'red',
        },
      },
      defaultEdge: {
        style: {
          stroke: 'blue',
          strokeOpacity: 0.5,
        },
      },
      edgeStateStyles: {
        selected: {
          stroke: 'red',
          strokeOpacity: 1,
        },
        active: {
          stroke: 'green',
          shadowColor: '#000',
          lineWidth: 5,
          shadowBlur: 10,
          opacity: 0.1,
        },
      },
    });

    const node = defaultGraph.addItem('node', {
      id: 'node9',
      x: 100,
      y: 100,
      type: 'rect',
      label: 'test label',
      style: {
        stroke: '#666',
      },
    });

    defaultGraph.on('node:click', (e) => {
      e.item.setState('selected', true);
    });

    const keyShape = node.get('keyShape');

    expect(keyShape.get('type')).toEqual('rect');
    // expect(keyShape.attr('fill')).toEqual('red');
    expect(keyShape.attr('stroke')).toEqual('#666');

    defaultGraph.setItemState(node, 'selected', true);

    expect(keyShape.attr('fill')).toEqual('green');
    expect(keyShape.attr('fillStyle')).toBe(null);
    expect(keyShape.attr('stroke')).toEqual('red');
    expect(keyShape.attr('strokeStyle')).toBe(null);

    defaultGraph.setItemState(node, 'selected', false);

    // expect(keyShape.attr('fill')).toEqual('red');
    expect(keyShape.attr('fillStyle')).toBe(null);
    expect(keyShape.attr('stroke')).toEqual('#666');
    expect(keyShape.attr('strokeStyle')).toBe(null);

    defaultGraph.updateItem(node, { style: { fill: '#ccc', stroke: '#444' } });

    expect(keyShape.attr('fill')).toEqual('#ccc');

    defaultGraph.setItemState(node, 'selected', true);

    expect(keyShape.attr('fill')).toEqual('green');
    expect(keyShape.attr('fillStyle')).toBe(null);
    expect(keyShape.attr('stroke')).toEqual('red');
    expect(keyShape.attr('strokeStyle')).toBe(null);

    defaultGraph.setItemState(node, 'selected', false);

    expect(keyShape.attr('fill')).toEqual('#ccc');
    expect(keyShape.attr('fillStyle')).toBe(null);
    expect(keyShape.attr('stroke')).toEqual('#444');
    expect(keyShape.attr('strokeStyle')).toBe(null);

    defaultGraph.addItem('node', { id: 'node10', x: 100, y: 50 });
    const edge = defaultGraph.addItem('edge', { id: 'edge', source: 'node9', target: 'node9', type: 'loop' });

    const edgeKeyShape = edge.get('keyShape');
    expect(edgeKeyShape.attr('stroke')).toEqual('blue');
    expect(edgeKeyShape.attr('strokeOpacity')).toEqual(0.5);

    defaultGraph.setItemState(edge, 'selected', true);

    expect(edgeKeyShape.attr('stroke')).toEqual('red');
    expect(edgeKeyShape.attr('strokeOpacity')).toEqual(1);

    defaultGraph.setItemState(edge, 'selected', false);
    expect(edgeKeyShape.attr('stroke')).toEqual('blue');
    expect(edgeKeyShape.attr('strokeOpacity')).toEqual(0.5);

    defaultGraph.setItemState(edge, 'active', true);

    expect(edgeKeyShape.attr('stroke')).toEqual('green');
    expect(edgeKeyShape.attr('shadowColor')).toEqual('#000');

    defaultGraph.setItemState(edge, 'active', false);

    expect(edgeKeyShape.attr('stroke')).toEqual('blue');
    defaultGraph.destroy();
  });

  it('graph with default cfg', () => {
    const div4 = document.createElement('div');
    div4.id = 'div4-spec';
    document.body.appendChild(div4);
    const defaultGraph = new Graph({
      container: div4,
      width: 500,
      height: 500,
      renderer: 'svg',
      defaultNode: {
        type: 'rect',
        size: [60, 40],
        color: '#ccc',
        labelCfg: {
          position: 'right',
          offset: 5,
          style: {
            fontSize: 14,
            fill: 'blue',
          },
        },
      },
      defaultEdge: {
        type: 'cubic',
        color: '#666',
      },
    });
    const node = defaultGraph.addItem('node', { id: 'node1', x: 100, y: 150, label: '111' });
    let model = node.get('model');

    expect(model.id).toEqual('node1');
    expect(model.x).toEqual(100);
    expect(model.y).toEqual(150);
    expect(model.type).toEqual('rect');
    expect(model.size[0]).toEqual(60);
    expect(model.size[1]).toEqual(40);
    expect(model.color).toEqual('#ccc');
    expect(model.labelCfg.position).toEqual('right');
    expect(model.labelCfg.style.fill).toEqual('blue');

    const node2 = defaultGraph.addItem('node', {
      id: 'node2',
      x: 150,
      y: 100,
      label: '222',
      color: '#666',
      type: 'circle',
    });

    model = node2.get('model');
    expect(model.type).toEqual('circle');
    expect(model.size[0]).toEqual(60);
    expect(model.size[1]).toEqual(40);
    expect(model.color).toEqual('#666');

    model.size[1] = 50;

    expect(model.size[1]).toEqual(50);
    expect(node.get('model').size[1]).toEqual(40);
    expect(model.labelCfg.position).toEqual('right');
    expect(model.labelCfg.style.fill).toEqual('blue');

    model.labelCfg.position = 'left';
    model.labelCfg.style.fill = 'red';

    expect(node.get('model').labelCfg.position).toEqual('right');
    expect(node.get('model').labelCfg.style.fill).toEqual('blue');

    const edge = defaultGraph.addItem('edge', {
      id: 'edge',
      source: 'node1',
      target: 'node2',
      type: 'line',
    });
    model = edge.get('model');

    expect(model.id).toEqual('edge');
    expect(model.source).toEqual('node1');
    expect(model.type).toEqual('line');
    expect(model.color).toEqual('#666');

    defaultGraph.destroy();

    expect(defaultGraph.destroyed).toBe(true);
  });
});

describe('plugins & layout', () => {
  const div5 = document.createElement('div');
  div5.id = 'div2-spec';
  document.body.appendChild(div5);
  it('add & remove plugins', () => {
    const graph = new Graph({
      container: div5,
      height: 500,
      width: 500,
      renderer: 'svg',
      modes: {
        default: ['zoom-canvas', 'drag-canvas']
      }
    });

    const data = {
      nodes: [
        {
          id: 'node',
          label: 'node',
        },
      ],
    };

    graph.data(data);
    graph.render();

    let plugins = graph.get('plugins');
    expect(plugins.length).toBe(0);

    const minimap = new Plugin.Minimap({
      size: [200, 200],
    });

    graph.addPlugin(minimap);
    plugins = graph.get('plugins');
    expect(plugins.length).toBe(1);

    graph.removePlugin(minimap);
    plugins = graph.get('plugins');
    expect(plugins.length).toBe(0);

    graph.destroy();
    expect(graph.destroyed).toBe(true);
  });
});

describe('auto rotate label on edge', () => {
  const div6 = document.createElement('div');
  div6.id = 'div6-spec';
  document.body.appendChild(div6);
  const graph = new Graph({
    container: div6,
    width: 500,
    height: 500,
    renderer: 'svg',
    defaultNode: {
      style: {
        opacity: 0.8,
      },
    },
    modes: {
      default: ['drag-node', 'zoom-canvas', 'drag-canvas'],
    },
  });
  const data = {
    nodes: [
      {
        id: 'node1',
        x: 50,
        y: 50,
      },
      {
        id: 'node2',
        x: 80,
        y: 150,
      },
      {
        id: 'node3',
        x: 180,
        y: 120,
      },
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
        label: 'node1-node2',
        style: {
          startArrow: true,
          endArrow: true,
        },
        labelCfg: {
          autoRotate: true,
        },
      },
      {
        source: 'node2',
        target: 'node3',
        label: 'node2-node3',
        style: {
          startArrow: true,
          endArrow: true,
          lineWidth: 8,
        },
      },
    ],
  };
  it('render', () => {
    graph.data(data);
    graph.render();
    const edge1 = graph.getEdges()[0];
    const label1 = edge1.get('group').get('children')[1];
    const label1Matrix = label1.attr('matrix');

    expect(label1Matrix[0]).toBe(0.2873479127883911);
    expect(label1Matrix[1]).toBe(0.9578263759613037);
    expect(label1Matrix[3]).toBe(-0.9578263759613037);
    expect(label1Matrix[4]).toBe(0.2873479127883911);
    expect(label1Matrix[6]).toBe(65);
    expect(label1Matrix[7]).toBe(100);
    const edge2 = graph.getEdges()[1];
    const label2 = edge2.get('group').get('children')[1];
    const label2Matrix = label2.attr('matrix');
    expect(label2Matrix[1]).toBe(0);
    expect(label2Matrix[3]).toBe(-0);
  });

  it('drag node', () => {
    const node = graph.getNodes()[1];
    graph.emit('node:dragstart', { x: 80, y: 150, item: node });
    graph.emit('node:drag', { x: 200, y: 200, item: node });
    graph.emit('node:dragend', { x: 200, y: 200, item: node });
    const edge1 = graph.getEdges()[0];
    const label1 = edge1.get('group').get('children')[1];
    const label1Matrix = label1.attr('matrix');
    expect(label1Matrix[0]).toBe(0.7071068286895752);
    expect(label1Matrix[1]).toBe(0.7071067094802856);
    expect(label1Matrix[3]).toBe(-0.7071067094802856);
    expect(label1Matrix[4]).toBe(0.7071068286895752);
    expect(label1Matrix[6]).toBe(125);
    expect(label1Matrix[7]).toBe(125);
    const edge2 = graph.getEdges()[1];
    const label2 = edge2.get('group').get('children')[1];
    const label2Matrix = label2.attr('matrix');
    expect(label2Matrix[0]).toBe(1);
    expect(label2Matrix[4]).toBe(1);
  });

  it('zoom and pan', () => {
    graph.zoom(0.5);
    graph.moveTo(100, 120);
    expect(graph.getZoom()).toBe(0.5);
    const viewPoint = graph.get('canvas').getCamera().getPosition()
    expect(numberEqual(viewPoint[0], 425, 1)).toBe(true);
    expect(numberEqual(viewPoint[1], 385, 1)).toBe(true);
    graph.destroy();
  });
});

describe('behaviors', () => {
  const div6 = document.createElement('div');
  div6.id = 'div7-spec';
  document.body.appendChild(div6);
  const graph = new Graph({
    container: div6,
    width: 500,
    height: 500,
    renderer: 'svg',
    edgeStateStyles: {
      inactive: {
        opacity: 0.1,
      },
      active: {
        stroke: '#000',
      },
    },
    nodeStateStyles: {
      inactive: {
        opacity: 0.1,
        // fill: '#0f0'
      },
      active: {
        stroke: '#000',
        lineWidth: 2,
        // fill: '#0f0'
        // opacity: 1
      },
      selected: {
        fill: '#f00',
      },
    },
    modes: {
      default: ['activate-relations', 'brush-select', 'drag-node'],
      select: [
        {
          type: 'click-select',
          multiple: false,
        },
      ],
      multiSelect: [],
      tooltip: ['tooltip', 'edge-tooltip'],
    },
  });
  const data = {
    nodes: [
      {
        id: 'node1',
        x: 50,
        y: 50,
        label: 'node1-label',
      },
      {
        id: 'node2',
        x: 80,
        y: 150,
        label: 'node2-label',
      },
      {
        id: 'node3',
        x: 180,
        y: 120,
        label: 'node3-label',
      },
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
        label: 'node1-node2',
        style: {
          startArrow: true,
          endArrow: true,
        },
        labelCfg: {
          autoRotate: true,
        },
      },
      {
        source: 'node2',
        target: 'node3',
        label: 'node2-node3',
        style: {
          startArrow: {
            path: 'M 10,0 L -10,-10 L -10,10 Z',
            d: 10,
          },
          endArrow: true,
          lineWidth: 3,
        },
      },
    ],
  };
  graph.data(data);
  graph.render();
  const item = graph.getNodes()[0];
  it('active-relations', () => {
    graph.emit('node:mouseenter', { item });
    const itemKeyShape = item.get('group').get('children')[0];
    expect(itemKeyShape.attr('stroke')).toBe('#000');
    expect(itemKeyShape.attr('lineWidth')).toBe(2);
    const relativeNode = graph.getNodes()[1];
    const relativeNodeKeyShape = relativeNode.get('group').get('children')[0];
    expect(relativeNodeKeyShape.attr('stroke')).toBe('#000');
    expect(relativeNodeKeyShape.attr('lineWidth')).toBe(2);
    const relativeEdge = graph.getEdges()[0];
    const relativeEdgeKeyShape = relativeEdge.get('group').get('children')[0];
    expect(relativeEdgeKeyShape.attr('stroke')).toBe('#000');

    const unrelativeNode = graph.getNodes()[2];
    const unrelativeNodeKeyShape = unrelativeNode.get('group').get('children')[0];
    expect(unrelativeNodeKeyShape.attr('lineWidth')).toBe(1);
    expect(unrelativeNodeKeyShape.attr('stroke')).toBe('rgb(191, 213, 255)');
    expect(unrelativeNodeKeyShape.attr('opacity')).toBe(0.1);
    const unrelativeEdge = graph.getEdges()[1];
    const unrelativeEdgeKeyShape = unrelativeEdge.get('group').get('children')[0];
    expect(unrelativeEdgeKeyShape.attr('stroke')).toBe('rgb(234, 234, 234)');
    expect(unrelativeEdgeKeyShape.attr('opacity')).toBe(0.1);

    graph.emit('node:mouseleave', { item });
    expect(itemKeyShape.attr('stroke')).toBe('rgb(95, 149, 255)');
    expect(itemKeyShape.attr('lineWidth')).toBe(1);
    expect(unrelativeNodeKeyShape.attr('lineWidth')).toBe(1);
    expect(unrelativeNodeKeyShape.attr('stroke')).toBe('rgb(95, 149, 255)');
    expect(unrelativeNodeKeyShape.attr('opacity')).toBe("");
  });
  it('click-select', () => {
    graph.setMode('select');
    graph.emit('node:click', { item });
    const itemKeyShape = item.get('group').get('children')[0];
    expect(itemKeyShape.attr('fill')).toBe('#f00');

    const item2 = graph.getNodes()[1];
    const item2KeyShape = item2.get('group').get('children')[0];
    expect(item2KeyShape.attr('fill')).toBe('rgb(239, 244, 255)');

    graph.emit('node:click', { item: item2 });
    expect(item2KeyShape.attr('fill')).toBe('#f00');
    expect(itemKeyShape.attr('fill')).toBe('rgb(239, 244, 255)');

    graph.emit('node:click', { item: item2 });
    expect(item2KeyShape.attr('fill')).toBe('rgb(239, 244, 255)');

    // multiple select
    graph.addBehaviors(['click-select'], 'multiSelect');
    graph.setMode('multiSelect');
    graph.emit('keydown', { key: 'shift' });
    graph.emit('node:click', { item });
    graph.emit('node:click', { item: item2 });
    expect(itemKeyShape.attr('fill')).toBe('#f00');
    expect(item2KeyShape.attr('fill')).toBe('#f00');

    graph.emit('canvas:click');
    expect(itemKeyShape.attr('fill')).toBe('rgb(239, 244, 255)');
    expect(item2KeyShape.attr('fill')).toBe('rgb(239, 244, 255)');
  });
  it('brush-select', () => {
    graph.setMode('default');

    graph.once('nodeselectchange', (evt) => {
      expect(evt.selectedItems.edges.length).toBe(2);
      expect(evt.selectedItems.nodes.length).toBe(3);
    });

    graph.emit('keydown', { key: 'shift' });
    // should not start when it start at an item
    graph.emit('dragstart', { item, canvasX: 0, canvasY: 0, x: 0, y: 0 });
    graph.emit('drag', { canvasX: 300, canvasY: 300, x: 300, y: 300 });
    graph.emit('dragend', { canvasX: 300, canvasY: 300, x: 300, y: 300 });
    graph.emit('keyup', { key: 'shift' });
    const itemKeyShape = item.get('group').get('children')[0];
    expect(itemKeyShape.attr('fill')).toBe('rgb(239, 244, 255)');

    graph.emit('keydown', { key: 'shift' });
    graph.emit('dragstart', { canvasX: 0, canvasY: 0, x: 0, y: 0 });
    graph.emit('drag', { canvasX: 300, canvasY: 300, x: 300, y: 300 });
    graph.emit('dragend', { canvasX: 300, canvasY: 300, x: 300, y: 300 });
    graph.emit('keyup', { key: 'shift' });
    expect(itemKeyShape.attr('fill')).toBe('#f00');
    const item2KeyShape = graph.getNodes()[1].get('group').get('children')[0];
    expect(item2KeyShape.attr('fill')).toBe('#f00');

    graph.once('nodeselectchange', (evt) => {
      expect(evt.select).toBe(false);
      expect(evt.selectedItems.edges.length).toBe(0);
      expect(evt.selectedItems.nodes.length).toBe(0);
    });

    graph.emit('canvas:click', {});
    expect(itemKeyShape.attr('fill')).toBe('rgb(239, 244, 255)');
    expect(item2KeyShape.attr('fill')).toBe('rgb(239, 244, 255)');
  });

  it('drag-node', (done) => {
    graph.emit('node:dragstart', { item, target: item, x: 0, y: 0 });
    graph.emit('node:drag', { item, target: item, x: 50, y: 150 });
    graph.emit('node:drag', { item, target: item, x: 50, y: 250 });
    graph.emit('node:dragend', { item, target: item, x: 50, y: 250 });
    expect(item.getModel().x).toBe(100);
    expect(item.getModel().y).toBe(300);
    const edge = graph.getEdges()[0];
    setTimeout(() => {
      expect(Math.abs((edge.getModel() as EdgeConfig).startPoint.x - 95) < 4).toBe(true);
      // expect(Math.abs((edge.getModel() as EdgeConfig).startPoint.y - 289) < 2).toBe(true);
      // multiple selected nodes to drag
      const item2 = graph.getNodes()[1];
      graph.setItemState(item, 'selected', true);
      graph.setItemState(item2, 'selected', true);
      graph.emit('node:dragstart', { item, target: item, x: 0, y: 0 });
      graph.emit('node:drag', { item, target: item, x: 50, y: 50 });
      graph.emit('node:dragend', { item, target: item, x: 50, y: 50 });
      expect(item.getModel().x).toBe(150);
      expect(item.getModel().y).toBe(350);
      expect(item2.getModel().x).toBe(130);
      expect(item2.getModel().y).toBe(200);
      done();
    }, 50);
  });

  it('tooltip edge-tooltip', () => {
    graph.setMode('tooltip');
    graph.emit('node:mouseenter', { item, canvasX: 150, canvasY: 350 });
    const tooltipCon = document.getElementsByClassName('g6-node-tooltip')[0] as HTMLElement;
    expect(tooltipCon.style.left).not.toBe(undefined);
    expect(tooltipCon.style.top).not.toBe(undefined);
    graph.emit('node:mouseleave', { item, canvasX: 150, canvasY: 350 });
    expect(tooltipCon.style.visibility).toBe('hidden');

    // edge-tooltip
    const edge = graph.getEdges()[0];
    graph.emit('edge:mouseenter', { item: edge, canvasX: 100, canvasY: 300 });
    const edgeTooltipCon = document.getElementsByClassName('g6-edge-tooltip')[0] as HTMLElement;
    expect(edgeTooltipCon.style.left).not.toBe(undefined);
    expect(edgeTooltipCon.style.top).not.toBe(undefined);
    graph.emit('node:mouseleave', { item: edge, canvasX: 150, canvasY: 350 });
    expect(tooltipCon.style.visibility).toBe('hidden');
    graph.destroy();
  });
});

describe('layouts', () => {
  const data = {
    nodes: [
      {
        id: 'node1',
      },
      {
        id: 'node2',
      },
      {
        id: 'node3',
      },
      {
        id: 'node4',
      },
      {
        id: 'node5',
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
        source: 'node1',
        target: 'node3',
      },
      {
        source: 'node1',
        target: 'node4',
      },
      {
        source: 'node4',
        target: 'node5',
      },
    ],
  };

  it('without layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
    });
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
    graph.destroy();
  });
  it('with force layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'force',
      },
    });
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
    graph.destroy();
  });
  it('with fruchterman layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'fruchterman',
      },
    });
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
    graph.destroy();
  });
  it('with radial layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'radial',
      },
    });
    graph.data(data);
    graph.render();

    graph.on('afterlayout', () => {
      const item = graph.getNodes()[0];
      expect(item.getModel().x).toBe(250);
      expect(item.getModel().y).toBe(250);
      graph.destroy();
    });
  });
  it('with circular layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'circular',
      },
    });
    graph.data(data);
    graph.render();

    graph.on('afterlayout', () => {
      const item = graph.getNodes()[0];
      expect(item.getModel().x).not.toBe(null);
      expect(item.getModel().x).not.toBe(undefined);
      expect(item.getModel().y).not.toBe(null);
      expect(item.getModel().y).not.toBe(undefined);
      graph.destroy();
    });
  });
  it('with grid layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'grid',
      },
    });
    graph.data(data);
    graph.render();

    graph.on('afterlayout', () => {
      const item = graph.getNodes()[0];
      expect(item.getModel().x).toBe(125);
      expect(item.getModel().y).toBe(83.33333333333333);
      graph.destroy();
    });
  });
  it('with concentric layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'concentric',
      },
    });
    graph.data(data);
    graph.render();

    graph.on('afterlayout', () => {
      const item = graph.getNodes()[0];
      expect(item.getModel().x).toBe(250);
      expect(item.getModel().y).toBe(250);
      graph.destroy();
    });
  });
  it('with mds layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'mds',
      },
    });
    graph.data(data);
    graph.render();
    graph.on('afterlayout', () => {
      const item = graph.getNodes()[0];
      expect(item.getModel().x).toBe(261.9235736012207);
      expect(item.getModel().y).toBe(249.99999999999997);
      graph.destroy();
    });
  });
  it('with dagre layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'dagre',
      },
      defaultEdge: {
        type: 'polyline',
      },
    });
    graph.data(data);
    graph.render();
    graph.on('afterlayout', () => {
      const item = graph.getNodes()[0];
      expect(item.getModel().x).not.toBe(null);
      expect(item.getModel().x).not.toBe(undefined);
      expect(item.getModel().y).not.toBe(null);
      expect(item.getModel().y).not.toBe(undefined);
      graph.destroy();
    });
  });
  it('change layout', (done) => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'circular',
      },
    });
    data.edges.forEach((edge: any) => {
      edge.type = 'line';
    });
    graph.data(data);
    graph.render();

    graph.updateLayout({
      type: 'force',
    });

    setTimeout(() => {
      expect(graph.get('layoutController').layoutMethods[0].type).toBe('force');
      graph.destroy();
      done();
    }, 100);
  });
  it('subgraph layout', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      layout: {
        type: 'grid',
      },
    });
    graph.data(data);
    graph.render();

    data.nodes.forEach((node: any) => {
      node.label = node.id;
    });
    const subdata = {
      nodes: [data.nodes[0], data.nodes[1], data.nodes[2]],
      edges: [data.edges[0], data.edges[1]],
    };
    const gridLayout = new Layout['circular']({
      center: [250, 250],
    });
    gridLayout.init(subdata);
    gridLayout.execute();
    graph.positionsAnimate();
    const item = graph.getNodes()[0];
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
    graph.destroy();
  });
});

describe('built-in items', () => {
  const data = {
    nodes: [
      {
        id: 'node1',
        type: 'circle',
        x: 50,
        y: 50,
      },
      {
        id: 'node2',
        type: 'rect',
        x: 200,
        y: 50,
      },
      {
        id: 'node3',
        type: 'ellipse',
        x: 350,
        y: 50,
      },
      {
        id: 'node4',
        type: 'star',
        x: 50,
        y: 150,
      },
      {
        id: 'node5',
        type: 'diamond',
        x: 200,
        y: 150,
      },
      {
        id: 'node6',
        type: 'triangle',
        x: 350,
        y: 150,
      },
      {
        id: 'node7',
        type: 'modelRect',
        x: 150,
        y: 300,
      },
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
        type: 'line',
      },
      {
        source: 'node2',
        target: 'node3',
        type: 'quadratic',
      },
      {
        source: 'node3',
        target: 'node4',
        type: 'cubic',
      },
      {
        source: 'node4',
        target: 'node5',
        type: 'cubic-horizontal',
      },
      {
        source: 'node4',
        target: 'node7',
        type: 'cubic-vertical',
      },
      {
        source: 'node6',
        target: 'node7',
        type: 'arc',
      },
      {
        source: 'node1',
        target: 'node1',
        type: 'loop',
      },
      {
        source: 'node6',
        target: 'node7',
        type: 'polyline',
      },
    ],
  };
  data.nodes.forEach((node: any, i) => {
    node.label = `node-${i + 1}`;
  });
  const div8 = document.createElement('div');
  div8.id = 'div8-spec';
  document.body.appendChild(div8);

  const graph = new Graph({
    container: div8,
    width: 500,
    height: 500,
    renderer: 'svg',
  });

  it('default style', () => {
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
  });
  // modelrect
  it('update node style', () => {
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    graph.updateItem(item, {
      style: {
        stroke: '#f00',
        lineWidth: 3,
        fill: '#0f0',
      },
      linkPoints: {
        top: true,
        left: true,
        fill: '#fff',
        stroke: '#333',
        lineWidth: 1,
        size: 6,
      },
    });
    expect(item.get('group').get('children').length).toBe(4);

    const modelRect = graph.getNodes()[6];
    graph.updateItem(modelRect, {
      style: {
        fill: '#ccc',
        shadowColor: '#0f0',
        shadowBlur: 50,
        shadowOffsetX: 50,
      },
      linkPoints: {
        right: true,
        left: true,
        fill: '#fff',
        stroke: '#f00',
        lineWidth: 1,
        size: 6,
      },
      description: 'description for it',
      descriptionCfg: {
        style: {
          // TODO: G svg fontSize 小于 12 不显示
          // fontSize: 10,
          fill: '#000',
        },
      },
    });
    expect(modelRect.get('group').get('children').length).toBe(8);
  });

  it('update edge style', () => {
    // loop
    const loop = graph.getEdges()[6];
    graph.updateItem(loop, {
      style: {
        endArrow: true,
      },
      loopCfg: {
        position: 'left',
        dist: 100,
        clockwise: false,
      },
    });
    const loopShape = loop.get('group').get('children')[0];
    expect(loopShape.attr('endArrow')).toBe(true);

    const cubic = graph.getEdges()[2];
    graph.updateItem(cubic, {
      label: 'cubic label',
      labelCfg: {
        autoRotate: true,
      },
      style: {
        stroke: '#f00',
        lineWidth: 2,
      },
    });
    const cubicShape = cubic.get('group').get('children')[0];
    const cubicTextShape = cubic.get('group').get('children')[1];
    expect(cubicShape.attr('stroke')).toBe('#f00');
    expect(cubicTextShape.attr('text')).toBe('cubic label');

    const polyline = graph.getEdges()[7];
    graph.updateItem(polyline.getSource(), {
      anchorPoints: [[0, 1]],
    });
    graph.updateItem(polyline.getTarget(), {
      anchorPoints: [[1, 0.5]],
    });
    graph.updateItem(polyline, {
      controlPoints: [{ x: 315, y: 300 }],
      sourceAnchor: 0,
      targetAnchor: 0,
      style: {
        stroke: '#000',
        lineWidth: 3,
      },
    });
    const polylineShape = polyline.get('group').get('children')[0];
    expect(polylineShape.attr('path')[0][1]).toBe(315.35898208618164);
    expect(polylineShape.attr('path')[0][2]).toBe(184.64101791381836);
    expect(polylineShape.attr('path')[1][1]).toBe(315);
    expect(polylineShape.attr('path')[1][2]).toBe(300);
    expect(polylineShape.attr('path')[2][1]).toBe(242.5);
    expect(polylineShape.attr('path')[2][2]).toBe(300);
    graph.destroy();
  });
});

describe('tree graph', () => {
  const div9 = document.createElement('div');
  div9.id = 'div9-spec';
  document.body.appendChild(div9);
  const data = {
    isRoot: true,
    id: 'Root',
    label: 'root',
    children: [
      {
        id: 'SubTreeNode1',
        label: 'SubTreeNode1',
        children: [
          {
            id: 'SubTreeNode1.1',
            label: 'SubTreeNode1.1',
          },
          {
            id: 'SubTreeNode1.2',
            label: 'SubTreeNode1.2',
          },
        ],
      },
      {
        id: 'SubTreeNode2',
        label: 'SubTreeNode2',
      },
    ],
  };

  const graph = new TreeGraph({
    container: div9,
    width: 500,
    height: 500,
    renderer: 'svg',
    layout: {
      type: 'dendrogram',
      direction: 'LR', // H / V / LR / RL / TB / BT
      nodeSep: 50,
      rankSep: 100,
    },
    modes: {
      default: ['drag-canvas', 'drag-node', 'collapse-expand'],
    },
  });

  it('render', () => {
    graph.data(data);
    graph.render();
    graph.fitView(50);
    const item = graph.findById('SubTreeNode1');
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
  });

  it('collapse-expand', () => {
    const item = graph.findById('SubTreeNode1');
    graph.emit('node:click', { item });
    expect(item.getModel().collapsed).toBe(true);
    setTimeout(() => {
      graph.emit('node:click', { item });
      expect(item.getModel().collapsed).toBe(false);
      graph.destroy();
    }, 500);
  });
});

describe('plugins', () => {
  const data2 = {
    nodes: [
      {
        id: 'node1',
        x: -100,
        y: -100,
      },
      {
        id: 'node2',
        x: -50,
        y: -100,
      },
      {
        id: 'node3',
        x: -10,
        y: 10,
      },
      {
        id: 'node4',
        x: 30,
        y: 80,
      },
      {
        id: 'node5',
        x: 35,
        y: 40,
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
        source: 'node1',
        target: 'node3',
      },
      {
        source: 'node1',
        target: 'node4',
      },
      {
        source: 'node4',
        target: 'node5',
      },
    ],
  };

  const div10 = document.createElement('div');
  div10.id = 'div10-spec';
  document.body.appendChild(div10);
  it('minimap default', (done) => {
    const minimap = new G6.Minimap();
    const graph = new Graph({
      container: div10,
      width: 500,
      height: 500,
      renderer: 'svg',
      plugins: [minimap],
      modes: {
        default: ['drag-node', 'drag-canvas', 'zoom-canvas'],
      },
    });
    graph.data(data2);
    graph.render();
    setTimeout(() => {
      const minimapGroup = minimap.get('canvas').get('children')[0];
      expect(minimapGroup.get('children').length).toBe(4);
      graph.zoom(2, { x: 250, y: 250 });

      expect(minimapGroup.get('children')[2].get('children').length).toBe(5);
      const viewport = minimap.get('viewport');
      expect(viewport.style.width).toBe('37px');
      expect(viewport.style.height).toBe('6px');
      expect(viewport.style.left).toBe('163px');
      expect(viewport.style.top).toBe('114px');
      graph.destroy();

      done();
    }, 200);
  });
  it('minimap delegate', () => {
    const minimap2 = new G6.Minimap({
      size: [100, 80],
      type: 'delegate',
    });
    const graph2 = new Graph({
      container: div10,
      width: 500,
      height: 500,
      renderer: 'svg',
      plugins: [minimap2],
      modes: {
        default: ['drag-node', 'drag-canvas', 'zoom-canvas'],
      },
    });
    graph2.data(data2);
    graph2.render();
    graph2.zoom(2, { x: 0, y: 0 });
    setTimeout(() => {
      const minimapGroup = minimap2.get('canvas').get('children')[0];
      expect(minimapGroup.get('children').length).toBe(10);
      const viewport = minimap2.get('viewport');
      expect(viewport.style.width).toBe('41.3333px');
      expect(viewport.style.height).toBe('37.3333px');
      expect(viewport.style.left).toBe('58.6667px');
      expect(viewport.style.top).toBe('42.6667px');
      graph2.destroy();
    }, 150);
  });
  it('minimap keyShape', () => {
    const minimap = new G6.Minimap({
      size: [100, 80],
      type: 'keyShape',
    });
    const graph = new Graph({
      container: div10,
      width: 500,
      height: 500,
      renderer: 'svg',
      plugins: [minimap],
      modes: {
        default: ['drag-node', 'drag-canvas', 'zoom-canvas'],
      },
    });
    data2.nodes.forEach((node: any, i) => {
      node.label = `node-${i}`;
    });
    graph.data(data2);
    graph.render();
    graph.zoom(2, { x: 10, y: 50 });
    setTimeout(() => {
      const minimapGroup = minimap.get('canvas').get('children')[0];
      expect(minimapGroup.get('children').length).toBe(10);
      const viewport = minimap.get('viewport');
      expect(viewport.style.width).toBe('40px');
      expect(viewport.style.height).toBe('30.6667px');
      expect(viewport.style.left).toBe('60px');
      expect(viewport.style.top).toBe('49.3333px');
      graph.destroy();
    }, 150);
  });

  it('edge bundling', () => {
    const bundling = new G6.Bundling({
      // bundleThreshold: 0.1,
    });
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      plugins: [bundling],
      layout: {
        type: 'circular',
      },
    });
    const bundlingData = {
      nodes: [
        {
          id: '0',
          label: '0',
        },
        {
          id: '1',
          label: '1',
        },
        {
          id: '2',
          label: '2',
        },
        {
          id: '3',
          label: '3',
        },
        {
          id: '4',
          label: '4',
        },
        {
          id: '5',
          label: '5',
        },
        {
          id: '6',
          label: '6',
        },
        {
          id: '7',
          label: '7',
        },
        {
          id: '8',
          label: '8',
        },
        {
          id: '9',
          label: '9',
        },
        {
          id: '10',
          label: '10',
        },
        {
          id: '11',
          label: '11',
        },
        {
          id: '12',
          label: '12',
        },
        {
          id: '13',
          label: '13',
        },
        {
          id: '14',
          label: '14',
        },
        {
          id: '15',
          label: '15',
        },
        {
          id: '16',
          label: '16',
        },
        {
          id: '17',
          label: '17',
        },
        {
          id: '18',
          label: '18',
        },
        {
          id: '19',
          label: '19',
        },
        {
          id: '20',
          label: '20',
        },
        {
          id: '21',
          label: '21',
        },
        {
          id: '22',
          label: '22',
        },
        {
          id: '23',
          label: '23',
        },
        {
          id: '24',
          label: '24',
        },
        {
          id: '25',
          label: '25',
        },
        {
          id: '26',
          label: '26',
        },
        {
          id: '27',
          label: '27',
        },
        {
          id: '28',
          label: '28',
        },
        {
          id: '29',
          label: '29',
        },
        {
          id: '30',
          label: '30',
        },
        {
          id: '31',
          label: '31',
        },
        {
          id: '32',
          label: '32',
        },
        {
          id: '33',
          label: '33',
        },
      ],
      edges: [
        {
          source: '0',
          target: '1',
        },
        {
          source: '0',
          target: '2',
        },
        {
          source: '0',
          target: '3',
        },
        {
          source: '0',
          target: '4',
        },
        {
          source: '0',
          target: '5',
        },
        {
          source: '0',
          target: '7',
        },
        {
          source: '0',
          target: '8',
        },
        {
          source: '0',
          target: '9',
        },
        {
          source: '0',
          target: '10',
        },
        {
          source: '0',
          target: '11',
        },
        {
          source: '0',
          target: '13',
        },
        {
          source: '0',
          target: '14',
        },
        {
          source: '0',
          target: '15',
        },
        {
          source: '0',
          target: '16',
        },
        {
          source: '2',
          target: '3',
        },
        {
          source: '4',
          target: '5',
        },
        {
          source: '4',
          target: '6',
        },
        {
          source: '5',
          target: '6',
        },
        {
          source: '7',
          target: '13',
        },
        {
          source: '8',
          target: '14',
        },
        {
          source: '9',
          target: '10',
        },
        {
          source: '10',
          target: '22',
        },
        {
          source: '10',
          target: '14',
        },
        {
          source: '10',
          target: '12',
        },
        {
          source: '10',
          target: '24',
        },
        {
          source: '10',
          target: '21',
        },
        {
          source: '10',
          target: '20',
        },
        {
          source: '11',
          target: '24',
        },
        {
          source: '11',
          target: '22',
        },
        {
          source: '11',
          target: '14',
        },
        {
          source: '12',
          target: '13',
        },
        {
          source: '16',
          target: '17',
        },
        {
          source: '16',
          target: '18',
        },
        {
          source: '16',
          target: '21',
        },
        {
          source: '16',
          target: '22',
        },
        {
          source: '17',
          target: '18',
        },
        {
          source: '17',
          target: '20',
        },
        {
          source: '18',
          target: '19',
        },
        {
          source: '19',
          target: '20',
        },
        {
          source: '19',
          target: '33',
        },
        {
          source: '19',
          target: '22',
        },
        {
          source: '19',
          target: '23',
        },
        {
          source: '20',
          target: '21',
        },
        {
          source: '21',
          target: '22',
        },
        {
          source: '22',
          target: '24',
        },
        {
          source: '22',
          target: '25',
        },
        {
          source: '22',
          target: '26',
        },
        {
          source: '22',
          target: '23',
        },
        {
          source: '22',
          target: '28',
        },
        {
          source: '22',
          target: '30',
        },
        {
          source: '22',
          target: '31',
        },
        {
          source: '22',
          target: '32',
        },
        {
          source: '22',
          target: '33',
        },
        {
          source: '23',
          target: '28',
        },
        {
          source: '23',
          target: '27',
        },
        {
          source: '23',
          target: '29',
        },
        {
          source: '23',
          target: '30',
        },
        {
          source: '23',
          target: '31',
        },
        {
          source: '23',
          target: '33',
        },
        {
          source: '32',
          target: '33',
        },
      ],
    };

    graph.data(bundlingData);
    graph.render();
    bundling.bundling(bundlingData);

    graph.destroy();
  });

  it('context menu', () => {
    const graph = new Graph({
      container: div10,
      width: 500,
      height: 500,
      renderer: 'svg',
    });

    graph.data(data2);
    graph.render();

    // create ul
    const conextMenuContainer = document.createElement('ul');
    conextMenuContainer.id = 'contextMenu';
    conextMenuContainer.style.position = 'absolute';

    // create li
    const firstLi = document.createElement('li');
    firstLi.innerText = 'Option 1';
    conextMenuContainer.appendChild(firstLi);

    const lastLi = document.createElement('li');
    lastLi.innerText = 'Option 2';
    conextMenuContainer.appendChild(lastLi);
    div.appendChild(conextMenuContainer);

    graph.on('node:contextmenu', (evt) => {
      // evt.preventDefault();
      // evt.stopPropagation();
      conextMenuContainer.style.left = `${evt.x + 20}px`;
      conextMenuContainer.style.top = `${evt.y}px`;
    });

    graph.on('node:mouseleave', () => {
      conextMenuContainer.style.left = '-150px';
    });

    const item = graph.getNodes()[1];
    graph.emit('node:contextmenu', {
      x: item.getModel().x,
      y: item.getModel().y,
    });

    graph.destroy();
  });
  it('grid', () => {
    const grid = new G6.Grid();
    const graph = new Graph({
      container: div10,
      width: 500,
      height: 500,
      renderer: 'svg',
      plugins: [grid],
      modes: {
        default: ['drag-canvas', 'zoom-canvas'],
      },
    });
    graph.data(data2);
    graph.render();

    const gridDom = document.getElementsByClassName('g6-grid')[0] as HTMLElement;
    expect(gridDom).not.toBe(undefined);
    const minZoom = graph.get('minZoom');
    const width = (500 * 80) / minZoom;
    const height = (500 * 80) / minZoom;
    expect(gridDom.style.width).toBe(`${width}px`);
    expect(gridDom.style.height).toBe(`${height}px`);
    // graph.destroy();
    // const parentDom = gridDom.parentNode.parentNode;
    // expect(parentDom).toBe(null);
  });
});
