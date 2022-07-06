import { AbstractCanvas } from '@antv/g-base';
import Graph from '../../implement-graph';

const div = document.createElement('div');
div.id = 'view-spec';
document.body.appendChild(div);

function numberEqual(a: number, b: number, gap = 0.001) {
  return Math.abs(a - b) <= gap;
}

describe('view', () => {
  const graph = new Graph({
    container: div,
    width: 500,
    height: 500,
    maxZoom: 20
    // fitView: true,
  });
  it('zoom and translate', () => {
    const data = {
      nodes: [
        {
          id: 'node',
          x: 100,
          y: 100,
          size: [150, 100],
          type: 'simple-rect',
          color: '#333',
          style: {
            fill: '#666',
          },
        },
      ],
    };
    graph.data(data);
    graph.render();

    const canvas: AbstractCanvas = graph.get('canvas');
    const oriBBox = canvas.getCanvasBBox();

    // 以矩形节点的左上角 (x - size[0] / 2, y - size[1] / 2) 为缩放中心
    graph.zoom(2, { x: 25, y: 50 })

    // 因为是相机移动，bbox 永远不会变化了
    const canvas: AbstractCanvas = graph.get('canvas');
    let bbox = canvas.getCanvasBBox();
    expect(bbox.x).toBe(oriBBox.x);
    expect(bbox.y).toBe(oriBBox.y);
    expect(bbox.maxX).toBe(oriBBox.maxX);
    expect(bbox.maxY).toBe(oriBBox.maxY);

    const camera = canvas.getCamera();
    expect(camera.getZoom()).toBe(2);
    const currentCameraPosition = camera.getPosition();
    const currentCenterPoint = canvas.getPointByCanvas(250, 250);
    expect(numberEqual(currentCameraPosition[0], currentCenterPoint.x, 1)).toBe(true);
    expect(numberEqual(currentCameraPosition[1], currentCenterPoint.y, 1)).toBe(true);

    // 平移
    graph.translate(50, 100)
    const currentCenterPoint2 = canvas.getPointByCanvas(250, 250);
    const currentCameraPosition2 = camera.getPosition();
    expect(currentCameraPosition[0] - currentCenterPoint2.x).toBe(50);
    expect(currentCameraPosition[1] - currentCenterPoint2.y).toBe(100);
    expect(currentCenterPoint2.x).toBe(currentCenterPoint2.x);
    expect(currentCenterPoint2.y).toBe(currentCenterPoint2.y);

    // 再以 rect 左上角为缩放中心放大
    graph.zoom(1.5, { x: 25, y: 50 })
    expect(camera.getZoom()).toBe(2 * 1.5);

    // 节点大小改变
    data.nodes[0].size = [30, 20];
    graph.changeData(data);
    graph.render();

    bbox = graph.get('canvas').getCanvasBBox();
    expect(numberEqual(bbox.x, 100 - 15, 1)).toBe(true);
    expect(numberEqual(bbox.y, 100 - 10, 1)).toBe(true);
    expect(numberEqual(bbox.width, 30, 1)).toBe(true);
    expect(numberEqual(bbox.height, 20, 1)).toBe(true);
  });

  it('fit view', () => {
    const canvas = graph.get('canvas');
    const camera = canvas.getCamera();
    graph.fitView();
    expect(numberEqual(camera.getZoom(), 5.33333 * 3)).toBe(true);
    const currentCenterPoint = canvas.getPointByCanvas(250, 250);
    expect(currentCenterPoint.x).toBe(100)
    expect(currentCenterPoint.y).toBe(100)
  });

  it('fitview with padding', () => {
    const data = {
      nodes: [
        {
          id: 'node',
          x: 10,
          y: 150,
          size: [1000, 1500],
          type: 'simple-rect',
          color: '#333',
          style: {
            fill: '#666',
          },
        },
      ],
    };
    graph.data(data);
    graph.render();
    graph.fitView([50, 50]);
    const canvas = graph.get('canvas');
    expect(numberEqual(canvas.getCamera().getZoom(), 0.267, 0.01)).toBe(true);
    const currentCenterPoint = canvas.getPointByCanvas(250, 250);
    expect(numberEqual(currentCenterPoint.x, 10, 0.1)).toBe(true);
    expect(numberEqual(currentCenterPoint.y, 150, 0.1)).toBe(true);
  });
  it('focus item', () => {
    graph.clear();
    graph.zoom(2, { x: 250, y: 250 });
    const node = graph.addItem('node', {
      id: 'focus-node',
      type: 'circle',
      x: 10,
      y: 10,
      size: 60,
      color: '#666',
    });
    // // focus node by item
    graph.focusItem(node);

    let centerPoint = graph.getPointByCanvas(250, 250);
    expect(centerPoint.x).toBe(10);
    expect(centerPoint.y).toBe(10);

    graph.zoom(0.1, { x: 10, y: 10 });
    centerPoint = graph.getPointByCanvas(250, 250);
    console.log('centerPoint', centerPoint);
    expect(numberEqual(centerPoint.x, 10, 0.1)).toBe(true);
    expect(numberEqual(centerPoint.y, 10, 0.1)).toBe(true);

    graph.translate(-250, -500);

    // focus node by id
    graph.focusItem('focus-node');
    centerPoint = graph.getPointByCanvas(250, 250);
    expect(numberEqual(centerPoint.x, 10, 0.1)).toBe(true);
    expect(numberEqual(centerPoint.y, 10, 0.1)).toBe(true);

    // // focus edge
    graph.addItem('node', {
      id: 'node-2', x: -300, y: -500, size: 60
    });
    graph.addItem('edge', {
      id: 'edge-0', source: 'focus-node', target: 'node-2'
    });
    graph.focusItem('edge-0');
    centerPoint = graph.getPointByCanvas(250, 250);
    expect(numberEqual(centerPoint.x, (10 - 300) / 2, 0.1)).toBe(true);
    expect(numberEqual(centerPoint.y, (10 - 500) / 2, 0.1)).toBe(true);
  });

  it('moveTo, zoomTo', () => {
    const canvasPoint = graph.getCanvasByPoint(-300, -500);
    graph.moveTo(canvasPoint.x, canvasPoint.y);
    let centerPoint = graph.getPointByCanvas(250, 250);
    expect(numberEqual(centerPoint.x, 10, 0.1)).toBe(true);
    expect(numberEqual(centerPoint.y, 10, 0.1)).toBe(true);

    expect(graph.get('canvas').getCamera().getZoom()).toBe(0.2);
    graph.zoomTo(0.4, { x: 10, y: 10 });
    expect(graph.get('canvas').getCamera().getZoom()).toBe(0.4);
    centerPoint = graph.getPointByCanvas(250, 250);
    expect(numberEqual(centerPoint.x, 10, 0.1)).toBe(true);
    expect(numberEqual(centerPoint.y, 10, 0.1)).toBe(true);
  });

  it('fitViewByRules', () => {
    const oriZoom = graph.getZoom();
    graph.fitView([10, 10], {
      onlyOutOfViewPort: true
    })
    expect(graph.getZoom()).toBe(oriZoom);
    graph.fitView([10, 10], {
      onlyOutOfViewPort: false,
      ratioRule: 'min'
    })
    const afterMinZoom = graph.getZoom()
    expect(afterMinZoom).not.toBe(oriZoom);
    graph.fitView([10, 10], {
      onlyOutOfViewPort: false,
      ratioRule: 'max'
    });
    const afterMaxZoom = graph.getZoom()
    expect(afterMaxZoom > afterMinZoom).toBe(true);
  });

  it('getPointByCanvas', () => {
    graph.fitView([10, 10], {
      onlyOutOfViewPort: false,
      ratioRule: 'min'
    })
    const point = graph.getPointByCanvas(250, 250);
    expect(numberEqual(point.x, (10 - 300) / 2, 0.1)).toBe(true);
    expect(numberEqual(point.y, (10 - 500) / 2, 0.1)).toBe(true);
  });
});