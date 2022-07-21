import { Canvas } from '@antv/g-adapter';
import { AbstractGraph } from '../../../src';
import '../../../src/behavior';
import { scale, translate } from '../../../src/util/math';

const div = document.createElement('div');
div.id = 'global-spec';
div.style.backgroundColor = '#ccc';
document.body.appendChild(div);
const div2 = document.createElement('div');
div2.id = 'graph-spec';
document.body.appendChild(div2);

const numberEqual = (a, b, gap = 1) => Math.abs(a - b) < gap;

class Graph extends AbstractGraph {
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

    const width: number = this.get('width');
    const height: number = this.get('height');

    const canvasCfg: any = {
      container,
      width,
      height,
      renderer: 'svg'
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

describe('graph', () => {
  const globalGraph = new Graph({
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

  it.only('invalid container', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Graph({} as any);
    }).toThrowError('invalid container');
  });

  it.only('new & destroy graph', () => {
    const div1 = document.createElement('div');
    div1.id = 'div1-spec';
    document.body.appendChild(div1);
    const inst = new Graph({
      container: div1,
      width: 500,
      height: 500,
      renderer: 'svg',
      modes: {
        default: ['drag-node'],
      },
    });
    const length = div1.childNodes.length;

    expect(inst).not.toBe(undefined);
    expect(inst instanceof Graph).toBe(true);
    expect(length).toBe(1);

    expect(inst.get('canvas')).not.toBe(undefined);
    expect(inst.get('group')).not.toBe(undefined);

    expect(inst.get('group').get('className')).toEqual('root-container');
    expect(
      inst
        .get('group')
        .get('id')
        .endsWith('-root'),
    ).toBe(true);

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
    expect(length - div1.childNodes.length).toBe(1);
  });

  it.only('render with data', () => {
    const div2 = document.createElement('div');
    div2.id = 'div2-spec';
    document.body.appendChild(div2);
    const inst = new Graph({
      container: div2,
      width: 500,
      height: 500,
      renderer: 'svg',
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
          label: 'edge'
        },
        {
          id: 'edge2',
          source: 'node1',
          target: 'node1',
          type: 'loop'
        },
        {
          id: 'edge3',
          source: 'node2',
          target: 'node2',
          type: 'loop'
        },
      ],
    };

    inst.data(data);
    inst.render();
    inst.destroy();
  });

  it.only('groupByTypes false', () => {
    const div3 = document.createElement('div');
    div3.id = 'div2-spec';
    document.body.appendChild(div3);
    const inst = new Graph({
      container: div3,
      width: 500,
      height: 500,
      renderer: 'svg',
      groupByTypes: false,
      linkCenter: true,
      defaultEdge: {
        style: { stroke: '#f00' }
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
    inst.destroy();
  });

  it.only('translate', () => {
    globalGraph.translate(100, 100);

    const preCenter = globalGraph.getPointByCanvas(250, 250);
    globalGraph.translate(200, 100);
    const afterCenter = globalGraph.getPointByCanvas(250, 250);
    expect(preCenter.x - afterCenter.x).toBe(200);
    expect(preCenter.y - afterCenter.y).toBe(100);
    globalGraph.resetViewport();
  });

  it.only('moveTo', () => {
    let group = globalGraph.get('group');
    let bbox = group.getCanvasBBox();

    globalGraph.moveTo(100, 100);

    const bboxCenter = {
      x: (bbox.minX + bbox.maxX) / 2,
      y: (bbox.minY + bbox.maxY) / 2
    }
    const bboxCenterCanvas = globalGraph.getCanvasByPoint(bboxCenter.x, bboxCenter.y);

    expect(numberEqual(bboxCenterCanvas.x, 100)).toBe(true);
    expect(numberEqual(bboxCenterCanvas.y, 100)).toBe(true);
  });

  it.only('zoom', () => {
    globalGraph.zoom(3, { x: 100, y: 100 });
    expect(globalGraph.getZoom()).toBe(3);
    const currentCenterPoint = globalGraph.getPointByCanvas(250, 250);
    expect(numberEqual(currentCenterPoint.x, 166.6666717529297, 1)).toBe(true);
    expect(currentCenterPoint.y).toBe(150);
  });

  it.only('minZoom & maxZoom', () => {
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

    expect(graph.getZoom()).toBe(1);

    graph.zoom(0.5, { x: 100, y: 100 });
    expect(graph.getZoom()).toBe(1);

    graph.zoom(5.5);
    expect(graph.getZoom()).toBe(1);
    graph.destroy();
  });

  it.only('zoomTo', () => {
    globalGraph.zoomTo(2);
    expect(globalGraph.getZoom()).toBe(2);

    globalGraph.zoomTo(1.5, { x: 250, y: 250 });
    expect(globalGraph.getZoom()).toBe(1.5);
  });

  it.only('change size', () => {
    const graph = new Graph({
      container: div,
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

  it.only('find', () => {
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

  it.only('findAll', () => {
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

  it.only('refresh positions', () => {
    const data = { id: 'node8', x: 100, y: 50, size: 50, className: 'test test2' };
    const node = globalGraph.addItem('node', data);
    let group = node.get('group');

    expect(group.getMatrix()[6]).toBe(100);
    expect(group.getMatrix()[7]).toBe(50);

    data.x = 50;
    data.y = 100;
    globalGraph.refreshPositions();
    group = node.get('group');
    expect(group.getMatrix()[6]).toBe(50);
    expect(group.getMatrix()[7]).toBe(100);
  });

  it.only('removeItem', () => {
    let removeNode = globalGraph.findById('remove-item');
    expect(removeNode).toBe(undefined);

    const data = { id: 'remove-item', x: 10, y: 50, size: 50, className: 'test test2' };
    const node = globalGraph.addItem('node', data);

    expect(node).not.toBe(undefined);

    globalGraph.removeItem('remove-item');
    removeNode = globalGraph.findById('remove-item');
    expect(removeNode).toBe(undefined);
  });

  it.only('canvas point & model point convert', () => {
    let point = globalGraph.getPointByCanvas(100, 100);
    expect(point.x).toBe(100);
    expect(point.y).toBe(100);

    globalGraph.translate(100, 100);

    point = globalGraph.getPointByCanvas(100, 100);
    expect(numberEqual(point.x, 0)).toBe(true);
    expect(numberEqual(point.y, 0)).toBe(true);

    globalGraph.zoom(1.5);

    point = globalGraph.getPointByCanvas(100, 100);
    expect(numberEqual(point.x, 0)).toBe(true);
    expect(numberEqual(point.y, 0)).toBe(true);

    globalGraph.translate(100, 100);
    point = globalGraph.getPointByCanvas(100, 100);
    expect(point.x).toBe(-100);
    expect(point.y).toBe(-100);

    globalGraph.resetViewport();
  });

  it.only('client point & model point convert', () => {
    const group = globalGraph.get('group');
    const bbox = globalGraph
      .get('canvas')
      .get('el')
      .getBoundingClientRect();

    let point = globalGraph.getPointByClient(bbox.left + 100, bbox.top + 100);

    expect(point.x).toBe(100);
    expect(point.y).toBe(100);

    globalGraph.translate(100, 100);

    point = globalGraph.getPointByClient(bbox.left + 100, bbox.top + 100);
    expect(numberEqual(point.x, 0)).toBe(true);
    expect(numberEqual(point.y, 0)).toBe(true);

    scale(group, [1.5, 1.5]);
    point = globalGraph.getPointByClient(bbox.left + 100, bbox.top + 100);
    expect(numberEqual(point.x, 0)).toBe(true);
    expect(numberEqual(point.y, 0)).toBe(true);

    globalGraph.resetViewport();
  });

  it.only('clear', () => {
    globalGraph.destroy();
    expect(globalGraph.destroyed).toBe(true);
  });
});

describe('all node link center', () => {
  const graph = new Graph({
    container: div,
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

  it.only('init', () => {
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
    expect(edge.get('keyShape').attr('path')).toEqual([['M', 10, 10], ['L', 100, 100]]);
  });

  it.only('loop', () => {
    graph.set('linkCenter', false);

    const node = graph.addItem('node', {
      id: 'circleNode',
      x: 150,
      y: 150,
      style: { fill: 'yellow' },
      anchorPoints: [[0, 0], [0, 1]],
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

  it.only('clear states', () => {
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

  // TODO:  svg edge shadow 相关没有恢复。
  it.only('default node & edge style', () => {
    const defaultGraph = new Graph({
      container: div,
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

    //  addItem有style会直接和defaultNode中定义的merge
    const node = defaultGraph.addItem('node', {
      id: 'node9',
      x: 100,
      y: 100,
      type: 'simple-rect',
      label: 'test label',
      style: {
        stroke: '#666',
      },
    });

    defaultGraph.on('node:click', e => {
      e.item.setState('selected', true);
    });

    const keyShape = node.get('keyShape');

    expect(keyShape.get('type')).toEqual('rect');
    expect(keyShape.attr('fill')).toEqual('red');
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

    defaultGraph.addItem('node', { id: 'node10' });
    const edge = defaultGraph.addItem('edge', { id: 'edge', source: 'node9', target: 'node9' });

    const edgeKeyShape = edge.get('keyShape');
    expect(edgeKeyShape.attr('stroke')).toEqual('blue');
    expect(edgeKeyShape.attr('strokeOpacity')).toEqual(0.5);

    defaultGraph.setItemState(edge, 'selected', true);

    expect(edgeKeyShape.attr('stroke')).toEqual('red');
    expect(edgeKeyShape.attr('strokeOpacity')).toEqual(1);

    defaultGraph.setItemState(edge, 'selected', false);
    expect(edgeKeyShape.attr('stroke')).toEqual('blue');
    expect(edgeKeyShape.attr('strokeOpacity')).toEqual(0.5);

    // 测试default状态不存在的属性
    // expect(edgeKeyShape.attr('shadowColor')).toBe('rgb(95, 149, 255)');
    defaultGraph.setItemState(edge, 'active', true);

    expect(edgeKeyShape.attr('stroke')).toEqual('green');
    expect(edgeKeyShape.attr('shadowColor')).toEqual('#000');

    defaultGraph.setItemState(edge, 'active', false);

    expect(edgeKeyShape.attr('stroke')).toEqual('blue');
    // TODO: G svg 版本将 shadow 相关更新为 null，shadow 没有消失
    // console.log(edgeKeyShape);
    // expect(edgeKeyShape.attr('shadowColor')).toBe(undefined);
    defaultGraph.destroy();
  });

  it.only('graph with default cfg', () => {
    const defaultGraph = new Graph({
      container: div,
      width: 500,
      height: 500,
      renderer: 'svg',
      defaultNode: {
        type: 'simple-rect',
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
    expect(model.type).toEqual('simple-rect');
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
      type: 'simple-circle',
    });

    model = node2.get('model');
    expect(model.type).toEqual('simple-circle');
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

describe('auto rotate label on edge', () => {
  const graph = new Graph({
    container: div,
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
  it.only('render', () => {
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
    expect(label2Matrix[0]).toBe(1);
    /** G 5.0 改动，matrix 带有图形的 x y 信息 */
    expect(label2Matrix[6]).toBe(130);
    expect(label2Matrix[7]).toBe(135);
  });

  it.only('zoom and pan', () => {
    graph.zoom(0.5);
    graph.moveTo(100, 120);
    expect(graph.getZoom()).toBe(0.5);
    console.log(graph.getPointByCanvas(250, 250))
    const point = graph.getPointByCanvas(250, 250);
    expect(numberEqual(point.x, 415)).toBe(true);
    expect(numberEqual(point.y, 360)).toBe(true);
    graph.destroy();
  });
});

describe('built-in items', () => {
  const data = {
    nodes: [
      {
        id: 'node1',
        type: 'simple-circle',
        x: 50,
        y: 50,
      },
      {
        id: 'node2',
        type: 'simple-rect',
        x: 200,
        y: 50,
      },
      {
        id: 'node3',
        x: 350,
        y: 50,
      },
      {
        id: 'node4',
        x: 50,
        y: 150,
      },
      {
        id: 'node5',
        x: 200,
        y: 150,
      },
      {
        id: 'node6',
        x: 350,
        y: 150,
      },
      {
        id: 'node7',
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
      },
    ],
  };
  data.nodes.forEach((node: any, i) => {
    node.label = `node-${i + 1}`;
  });

  const graph = new Graph({
    container: div,
    width: 500,
    height: 500,
    renderer: 'svg',
  });

  it.only('default style', () => {
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    expect(item.getModel().x).not.toBe(null);
    expect(item.getModel().x).not.toBe(undefined);
    expect(item.getModel().y).not.toBe(null);
    expect(item.getModel().y).not.toBe(undefined);
  });
  it.only('update node style', () => {
    graph.data(data);
    graph.render();
    const item = graph.getNodes()[0];
    graph.updateItem(item, {
      style: {
        stroke: '#f00',
        lineWidth: 3,
        fill: '#0f0',
      },
    });

    expect(item.get('group').get('children').length).toBe(2);
  });

  it.only('update edge style', () => {
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
    const cubicTextShape = cubic.get('group').get('children')[1].get('children')[0];
    expect(cubicShape.attr('stroke')).toBe('#f00');
    expect(cubicTextShape.attr('text')).toBe('cubic label');
    graph.destroy();
  });
});
describe("test node label", () => {
  const graph = new Graph({
    container: div,
    width: 500,
    height: 500,
    renderer: 'svg',
  });
  it.only('update the position of node label and it is correct', () => {
    const graphData = {
      nodes: [
        {
          id: "circle",
          label: "circle",
          x: 250,
          y: 150
        }
      ]
    };
    graph.data(graphData);
    graph.render();
    const item = graph.getNodes()[0];
    graph.updateItem(item, {
      labelCfg: {
        position: "left"
      },
    });
    check("left");
    graph.updateItem(item, {
      labelCfg: {
        position: "bottom"
      },
    });
    check("bottom");
    graph.updateItem(item, {
      labelCfg: {
        position: "center"
      },
    });
    check("center");
    function check(position: string) {
      const positionMap = {
        left: {
          textAlign: "right",
          textBaseline: "middle"
        },
        bottom: {
          textAlign: "center",
          textBaseline: "top"
        },
        right: {
          textAlign: "left",
          textBaseline: "middle"
        },
        top: {
          textAlign: "center",
          textBaseline: "bottom"
        },
        center: {
          textAlign: "center",
          textBaseline: "middle"
        }
      }
      const nodeLabel = item.get('group')["shapeMap"]["node-label"];
      const textAlignToBe = positionMap[position].textAlign;
      const textBaselineToBe = positionMap[position].textBaseline;
      expect(nodeLabel.attr('textAlign')).toBe(textAlignToBe);
      expect(nodeLabel.attr('textBaseline')).toBe(textBaselineToBe);
    }
    graph.destroy();
  });
});
