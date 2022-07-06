import { Graph } from '../../../src';
import '../../../src';

const div = document.createElement('div');
div.id = 'edge-shape';
document.body.appendChild(div);

describe('polyline edge', () => {
  it('polyline edge', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      // linkCenter: true,
      modes: {
        default: [
          {
            type: 'drag-node',
            // enableDebounce: true,
            enableOptimize: true,
          },
          'zoom-canvas',
          'drag-canvas',
        ],
      },
      defaultEdge: {
        type: 'polyline',
      },
      defaultNode: {
        type: 'rect',
        size: [10, 10],
      },
      fitCenter: true,
    });
    const data = {
      nodes: [
        {
          id: 'root',
          x: 50,
          y: 250,
        },
      ],
      edges: [],
    };
    for (let i = 0; i < 20; i++) {
      data.nodes.push({
        id: `${i}`,
        x: 200,
        y: 10 + i * 10,
      });
      data.edges.push({
        source: 'root',
        target: `${i}`,
      });
    }
    graph.data(data);
    graph.render();
  });
  it('polyline edge', () => {
    const graph = new Graph({
      container: div,
      width: 500,
      height: 500,
      // linkCenter: true,
      modes: {
        default: ['drag-node', 'zoom-canvas', 'drag-canvas'],
      },
      defaultEdge: {
        type: 'polyline',
        style: {
          offset: 5,
          gridSize: 5
        },
        routeCfg: {
          gridSize: 5
        }
      },
      defaultNode: {
        type: 'rect',
        size: [10, 10],
        style: {
          opacity: 0.1
        }
      },
      // fitCenter: true,
    });
    const data = {
      nodes: [
        {
          id: '1',
          x: 100,
          y: 300,
          anchorPoints: [[0.5, 1], [1, 0.5]],
          label: '1'
        },
        {
          id: '2',
          x: 122,
          y: 300,
          anchorPoints: [[0.5, 1], [0.5, 0]],
          label: '2'
        },
      ],
      edges: [
        {
          source: '1',
          target: '2',
          sourceAnchor: 1,
          targetAnchor: 1
        },
      ],
    };
    graph.data(data);
    graph.render();
    const edge = graph.getEdges()[0];
    const keyShape = edge.getKeyShape();
    let path = keyShape.attr('path').split(' ');
    graph.getGroup().addShape('circle', {
      attrs: {
        r: 1,
        fill: '#f00',
        x: 105.5,
        y: 300
      }
    })
    graph.getGroup().addShape('circle', {
      attrs: {
        r: 1,
        fill: '#0f0',
        x: 127.5,
        y: 300
      }
    })
    expect(path[0]).toBe('M105');
    expect(path[1]).toBe("300L110");
    expect(path[2]).toBe("300L110");
    expect(path[3]).toBe("290L122");
    expect(path[4]).toBe("290L122");
    expect(path[5]).toBe("295");

    graph.destroy();
  });
});
