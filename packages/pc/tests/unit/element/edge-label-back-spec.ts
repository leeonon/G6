import { Canvas } from '@antv/g6-g-adapter';
import { Graph } from '../../../src';
import '../../../src';
import { numberEqual } from '../layout/util';

const div = document.createElement('div');
div.id = 'edge-shape';
document.body.appendChild(div);

const canvas = new Canvas({
  container: 'edge-shape',
  width: 600,
  height: 600,
  renderer: 'canvas'
});

describe('text background label', () => {
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
        x: 250,
        y: 200,
        label: 'node2',
      },
      {
        id: 'node3',
        x: 100,
        y: 350,
        label: 'node3',
      },
    ],
    edges: [
      {
        source: 'node1',
        target: 'node2',
        label: 'edge 1',
      },
      {
        source: 'node2',
        target: 'node3',
        label: 'edge 2asdfasdfasdfasdf',
        labelCfg: {
          position: 'end',
          refX: 10,
          refY: -20,
          style: {
            textBaseline: 'bottom'
          }
        }
      },
      {
        source: 'node3',
        target: 'node1',
        label: 'edge 3',
      },
    ],
  };

  const graph = new Graph({
    container: 'edge-shape',
    width: 500,
    height: 500,
    // translate the graph to align the canvas's center, support by v3.5.1
    fitCenter: true,
    defaultNode: {
      type: 'circle',
      labelCfg: {
        position: 'bottom',
        style: {
          background: {
            fill: '#ffffff',
            stroke: '#9EC9FF',
            padding: [2, 2, 2, 2],
            radius: 2,
          },
        }
      },
    },
    defaultEdge: {
      labelCfg: {
        autoRotate: true,
        style: {
          fill: '#1890ff',
          fontSize: 14,
          background: {
            fill: '#ffffff',
            stroke: '#9EC9FF',
            padding: [2, 2, 2, 2],
            radius: 2,
          },
        },
      },
    },
    modes: {
      default: ['drag-canvas', 'drag-node', 'activate-relations'],
    },
    nodeStateStyles: {
      // style configurations for hover state
      hover: {
        fillOpacity: 0.8,
      },
      // style configurations for selected state
      selected: {
        lineWidth: 5,
      },
    },
  });
  it('text background label', (done) => { // 
    const mat = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    graph.data(data);
    graph.render();
    const labelGroup = graph.getEdges()[1].getContainer().find(ele => ele.get('className') === 'label-group');
    let edge1bgMatrix = labelGroup.getMatrix();
    console.log('edge1bgMatrix', edge1bgMatrix);
    expect(edge1bgMatrix[0]).toBe(0.7071068286895752);
    expect(edge1bgMatrix[6]).toBe(114.14213562011719);
    expect(edge1bgMatrix[7]).toBe(364.14215087890625);

    graph.updateItem('node3', {
      x: 110,
      y: 250,
    });
    setTimeout(() => {
      edge1bgMatrix = labelGroup.getMatrix();
      expect(edge1bgMatrix[0]).toBe(0.9417418837547302);
      expect(edge1bgMatrix[6]).toBe(116.72673034667969);
      expect(edge1bgMatrix[7]).toBe(268.8348388671875);
      graph.updateItem('node3', {
        x: 250,
        y: 200,
      })
      setTimeout(() => {
        edge1bgMatrix = labelGroup.getMatrix();
        const pos = labelGroup.get('pos');
        expect(edge1bgMatrix[0]).toBe(1);
        expect(edge1bgMatrix[6]).toBe(260);
        expect(edge1bgMatrix[7]).toBe(180);
        expect(pos.x).toBe(260);
        expect(pos.y).toBe(180);
        done()
      }, 30);
    }, 100)
  });
  it('text background with autoRotate false and clearItemStates', (done) => { // done
    let edge = graph.getEdges()[0];
    const labelGroup = edge.getContainer().find(ele => ele.get('className') === 'label-group');
    let { x, y } = labelGroup.get('pos');
    expect(x).toBe(200);
    expect(y).toBe(125);

    graph.updateItem(graph.getNodes()[0], {
      x: graph.getNodes()[0].getModel().x + 100,
      y: graph.getNodes()[0].getModel().y + 100,
    });
    graph.clearItemStates(edge, ['active']);

    setTimeout(() => {
      const { x: newX, y: newY } = labelGroup.get('pos');
      expect(numberEqual(newX, 250, 2)).toBe(true);
      expect(numberEqual(newY, 175, 2)).toBe(true);
      done()
    }, 16);
  });
});