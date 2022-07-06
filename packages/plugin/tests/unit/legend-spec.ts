import G6 from '@antv/g6';
import Legend from '../../src/legend';

const testblock = document.createElement('div');
testblock.style.height = '100px'
testblock.style.width = '100px'
testblock.style.backgroundColor = '#f00'
document.body.appendChild(testblock);

const div = document.createElement('div');
div.id = 'legend-spec';
document.body.appendChild(div);

describe('legend', () => {
  const legendData = {
    nodes: [{
      id: 'type1',
      label: 'node-type1',
      type: 'circle',
      order: 4,
      size: 5,
      style: {
        fill: 'red'
      }
    }, {
      id: 'type2',
      label: 'node-type2',
      type: 'circle',
      order: 0,
      size: 10,
      style: {
        r: 10,
        fill: 'blue'
      }
    }, {
      id: 'type3',
      label: 'node-type3',
      type: 'rect',
      order: 2,
      size: [10, 10],
      style: {
        fill: 'green'
      }
    }],
    edges: [{
      id: 'eType1',
      label: 'edge-type1',
      type: 'line',
      order: 2,
      size: 20,
      style: {
        stroke: '#0f0',
      }
    }, {
      id: 'eType2',
      label: 'edge-type2',
      type: 'cubic'
    }, {
      id: 'eType3',
      label: 'edge-type3',
      type: 'quadratic',
      size: 25,
      style: {
        stroke: '#f00'
      }
    }]
  }
  const data = {
    nodes: [
      {
        id: '1',
        label: '1-type1',
        legendType: 'type1',
      },
      {
        id: '2',
        label: '2-type2',
        legendType: 'type2',
      },
      {
        id: '3',
        label: '3-type1',
        legendType: 'type1',
      },
      {
        id: '4',
        label: '4',
      },
    ],
    edges: [{
      source: '1',
      target: '3',
      legendType: 'edge-type1',
      label: '1->3:edge-type1'
    }, {
      source: '1',
      target: '4',
      legendType: 'edge-type3',
      label: '1->4:edge-type3'
    }, {
      source: '3',
      target: '4'
    }, {
      source: '2',
      target: '4',
      legendType: 'edge-type1',
      label: '2->4:edge-type1'
    }]
  };
  it('legend with default position and click multiple filtering', (done) => {
    const legend = new Legend({
      data: legendData,
      align: 'center',
      layout: 'horizontal', // vertical
      vertiSep: 70,
      horiSep: 20,
      offsetY: 6,
      padding: [4, 12, 8, 12],
      containerStyle: {
        fill: '#ff0',
        lineWidth: 1
      },
      title: 'Legend',
      titleConfig: {
        position: 'center',
        offsetX: 0,
        offsetY: 12,
      },
      filter: {
        enable: true,
        multiple: true,
        trigger: 'click',
        filterFunctions: {
          'type1': (d) => {
            if (d.legendType === 'type1') return true;
            return false
          },
          'type2': (d) => {
            if (d.legendType === 'type2') return true;
            return false
          },
          'type3': (d) => {
            if (d.legendType === 'type3') return true;
            return false
          },
          'eType1': (d) => {
            if (d.legendType === 'edge-type1') return true;
            return false
          },
          'eType2': (d) => {
            if (d.legendType === 'edge-type2') return true;
            return false
          },
          'eType3': (d) => {
            if (d.legendType === 'edge-type3') return true;
            return false
          },
        }
      }
    });

    const graph = new G6.Graph({
      container: div,
      width: 600,
      height: 400,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node']
      },
      edgeStateStyles: {
        active: {
          lineWidth: 3
        },
        inactive: {
          opacity: 0.5
        }
      },
      // plugins: [legend]
    });
    graph.read(data);
    graph.get('canvas').get('el').style.backgroundColor = '#ccc'
    setTimeout(() => {
      graph.addPlugin(legend)
      expect(document.getElementsByClassName('g6-legend-container').length).not.toBe(0);

      const legendCanvas = legend.get('legendCanvas');
      const rootGroup = legendCanvas.get('children')[0];
      const nodeGroup = rootGroup.find(e => e.get('name') === 'node-group');
      const edgeGroup = rootGroup.find(e => e.get('name') === 'edge-group');
      const legendNode0Shape = nodeGroup.get('children')[0].get('children')[0];
      // G 5.0 通过 canvas.emit 会强制把 target 变为 canvas，因此无法通过 legendCanvas.emit 来测试触发图例项点击事件
      legend.filterData({ target: legendNode0Shape });
      expect(graph.findAllByState('node', 'active').length).toBe(1)

      const legendNode2Shape = nodeGroup.get('children')[2].get('children')[0];
      legend.filterData({ target: legendNode2Shape });
      expect(graph.findAllByState('node', 'active').length).toBe(3)

      legend.clearFilter();
      legend.clearActiveLegend();
      expect(graph.findAllByState('node', 'active').length).toBe(0)


      const legendEdge0Shape = edgeGroup.get('children')[0].get('children')[0];
      legend.filterData({ target: legendEdge0Shape });
      expect(graph.findAllByState('edge', 'active').length).toBe(2);

      graph.destroy()
      done();
    }, 500);
  });
  it('legend with right position and mouseenter filtering', (done) => {
    const legend = new Legend({
      data: legendData,
      align: 'right',
      layout: 'vertical',
      vertiSep: 0,
      offsetY: 16,
      padding: [4, 12, 50, 12],
      filter: {
        enable: true,
        multiple: true, // will not take effect when tirgger is mouseenter
        trigger: 'mouseenter',
        filterFunctions: {
          'type1': (d) => {
            if (d.legendType === 'type1') return true;
            return false
          },
          'type2': (d) => {
            if (d.legendType === 'type2') return true;
            return false
          },
          'type3': (d) => {
            if (d.legendType === 'type3') return true;
            return false
          },
          'eType1': (d) => {
            if (d.legendType === 'edge-type1') return true;
            return false
          },
          'eType2': (d) => {
            if (d.legendType === 'edge-type2') return true;
            return false
          },
          'eType3': (d) => {
            if (d.legendType === 'edge-type3') return true;
            return false
          },
        }
      }
    });

    const graph = new G6.Graph({
      container: div,
      width: 400,
      height: 400,
      modes: {
        default: ['drag-canvas', 'zoom-canvas', 'drag-node']
      },
      edgeStateStyles: {
        active: {
          lineWidth: 3
        },
        inactive: {
          opacity: 0.5
        }
      }
    });
    graph.read(data);

    setTimeout(() => {
      graph.addPlugin(legend)
      expect(document.getElementsByClassName('g6-legend-container').length).not.toBe(0);

      const legendCanvas = legend.get('legendCanvas');
      const rootGroup = legendCanvas.get('children')[0];
      const nodeGroup = rootGroup.find(e => e.get('name') === 'node-group');
      const edgeGroup = rootGroup.find(e => e.get('name') === 'edge-group');
      const legendNode0Shape = nodeGroup.get('children')[0].get('children')[0];
      legend.filterData({ target: legendNode0Shape });
      expect(graph.findAllByState('node', 'active').length).toBe(1)
      legend.clearFilter();
      legend.clearActiveLegend();

      const legendNode2Shape = nodeGroup.get('children')[2].get('children')[0];
      legend.filterData({ target: legendNode2Shape });
      expect(graph.findAllByState('node', 'active').length).toBe(2)
      legend.clearFilter();
      legend.clearActiveLegend();
      expect(graph.findAllByState('node', 'active').length).toBe(0)

      legend.clearFilter();
      legend.clearActiveLegend();
      expect(graph.findAllByState('node', 'active').length).toBe(0)


      const legendEdge0Shape = edgeGroup.get('children')[0].get('children')[0];
      legend.filterData({ target: legendEdge0Shape });
      expect(graph.findAllByState('edge', 'active').length).toBe(2)

      graph.destroy()
      done();
    }, 500);
  });
});

