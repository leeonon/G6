import { Renderer } from '@antv/g-canvas';
import { Canvas, Group } from '../../src';

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('path test', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  let lineArrow, pathArrow, polylineArrow;

  it('line with endArrow startArrow', () => {
    lineArrow = subGroup.addShape('line', {
      attrs: {
        x1: 50,
        y1: 50,
        x2: 100,
        y2: 100,
        stroke: '#509FEE',
        lineWidth: 4,
        lineDash: [8, 8],
        lineCap: 'round',
        shadowBlur: 10,
        endArrow: {
          fill: '#f00',
          path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
        },
      },
      name: 'pathArrow-shape-name',
      id: 'pathArrow-shape-id'
    });
    expect(lineArrow.get('name')).toBe('pathArrow-shape-name');
    expect(lineArrow.get('id')).toBe('pathArrow-shape-id');

    expect(lineArrow.attr('startArrow')).toBe(undefined);
    expect(lineArrow.attr('endArrow')).not.toBe(undefined);

    lineArrow.attr('shadowColor', '#f00');
    lineArrow.attr('shadowBlur', 50)
    lineArrow.attr({
      'shadowColor': undefined
    })

    expect(lineArrow.attr('x1')).toBe(50);
    expect(lineArrow.getBody().style.x1).toBe(50);

    lineArrow.attr('x1', 100);
    lineArrow.attr('y1', 200);
    expect(lineArrow.attr('x1')).toBe(100);
    expect(lineArrow.attr('y1')).toBe(200);

    expect(lineArrow.attr('stroke')).toBe('#509FEE');
    expect(lineArrow.style.stroke).toBe('#509FEE');
    expect(lineArrow.getBody().style.stroke).toBe('#509FEE');

    expect(lineArrow.getEndHead().style.fill).toBe('#f00');
    expect(lineArrow.attr('fill')).toBe("");

    lineArrow.attr('startArrow', true);
    expect(lineArrow.attr('startArrow')).toBe(true);
    expect(!!lineArrow.style.startHead).toBe(true);

    lineArrow.attr('startArrow', {
      fill: '#0f0',
      path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
    });
    expect(typeof lineArrow.attr('startArrow')).toBe('object');
    expect(typeof lineArrow.style.startHead).toBe('object');

    lineArrow.attr({ endArrow: false });
    expect(lineArrow.attr('endArrow')).toBe(false);

    const attrs = lineArrow.attr();
    expect(attrs.endArrow).toBe(false);
    expect(attrs.lineCap).toBe('round');
    expect(attrs.lineWidth).toBe(4);
  });

  it('path with endArrow startArrow', () => {
    const path = 'M 100,300' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80'
    pathArrow = subGroup.addShape('path', {
      attrs: {
        path,
        stroke: '#509FEE',
        lineWidth: 4,
        lineDash: [8, 8],
        lineCap: 'round',
        endArrow: {
          fill: '#f00',
          path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
        },
      },
      name: 'pathArrow-shape-name',
      id: 'pathArrow-shape-id'
    });
    expect(pathArrow.get('name')).toBe('pathArrow-shape-name');
    expect(pathArrow.get('id')).toBe('pathArrow-shape-id');

    expect(pathArrow.attr('startArrow')).toBe(undefined);
    expect(pathArrow.attr('endArrow')).not.toBe(undefined);

    expect(pathArrow.attr('path')).toBe(path);
    expect(pathArrow.getBody().style.path).toBe(path);

    const path2 = [
      ['M', 300, 300],
      ['L', 350, 300],
      ['L', 400, 350],
    ]

    // pathArrow.attr('path', path2);
    pathArrow.attr({ 'path': path2 });
    expect(pathArrow.attr('path')[0][0]).toBe('M');
    expect(pathArrow.attr('path')[1][0]).toBe('L');

    expect(pathArrow.attr('stroke')).toBe('#509FEE');
    expect(pathArrow.style.stroke).toBe('#509FEE');
    expect(pathArrow.getBody().style.stroke).toBe('#509FEE');

    expect(pathArrow.getEndHead().style.fill).toBe('#f00');
    expect(pathArrow.attr('fill')).toBe("");

    pathArrow.attr('startArrow', true);
    expect(pathArrow.attr('startArrow')).toBe(true);
    expect(!!pathArrow.style.startHead).toBe(true);

    pathArrow.attr('startArrow', {
      fill: '#0f0',
      path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
    });
    expect(typeof pathArrow.attr('startArrow')).toBe('object');
    expect(typeof pathArrow.style.startHead).toBe('object');

    pathArrow.attr({ endArrow: false });
    expect(pathArrow.attr('endArrow')).toBe(false);

    const attrs = pathArrow.attr();
    expect(attrs.endArrow).toBe(false);
    expect(attrs.lineCap).toBe('round');
    expect(attrs.lineWidth).toBe(4);
  });

  it('polyline with endArrow startArrow', () => {
    const points = [
      [100, 0],
      [150, 0],
      [150, 50],
      [200, 50],
      [200, 100],
      [250, 100],
    ];
    polylineArrow = subGroup.addShape('polyline', {
      attrs: {
        points,
        stroke: '#509FEE',
        lineWidth: 4,
        lineDash: [8, 8],
        lineCap: 'round',
        endArrow: {
          fill: '#f00',
          path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
        },
      },
      name: 'pathArrow-shape-name',
      id: 'pathArrow-shape-id'
    });
    expect(polylineArrow.get('name')).toBe('pathArrow-shape-name');
    expect(polylineArrow.get('id')).toBe('pathArrow-shape-id');

    expect(polylineArrow.attr('startArrow')).toBe(undefined);
    expect(polylineArrow.attr('endArrow')).not.toBe(undefined);

    expect(polylineArrow.attr('points')).toBe(points);
    expect(polylineArrow.attr('points').length).toBe(6);
    expect(polylineArrow.getBody().style.points).toBe(points);

    const points2 = [
      [350, 100],
      [350, 150],
      [400, 150],
      [400, 200],
      [450, 200],
    ]

    polylineArrow.attr('points', points2);
    expect(polylineArrow.attr('points').length).toBe(5);

    expect(polylineArrow.attr('stroke')).toBe('#509FEE');
    expect(polylineArrow.style.stroke).toBe('#509FEE');
    expect(polylineArrow.getBody().style.stroke).toBe('#509FEE');

    expect(polylineArrow.getEndHead().style.fill).toBe('#f00');
    expect(polylineArrow.attr('fill')).toBe("");

    polylineArrow.attr('startArrow', true);
    expect(polylineArrow.attr('startArrow')).toBe(true);
    expect(!!polylineArrow.style.startHead).toBe(true);

    polylineArrow.attr('startArrow', {
      fill: '#0f0',
      path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
    });
    expect(typeof polylineArrow.attr('startArrow')).toBe('object');
    expect(typeof polylineArrow.style.startHead).toBe('object');

    polylineArrow.attr({ endArrow: false });
    expect(polylineArrow.attr('endArrow')).toBe(false);

    const attrs = polylineArrow.attr();
    expect(attrs.endArrow).toBe(false);
    expect(attrs.lineCap).toBe('round');
    expect(attrs.lineWidth).toBe(4);
  });

  it('getTotalLength', () => {
    // line
    lineArrow.attr('x1', 50);
    lineArrow.attr('y1', 50);
    const expectLength1 = 50 * Math.sqrt(2);
    expect(approximate(lineArrow.getBody().getTotalLength(), expectLength1)).toBe(true);
    expect(approximate(lineArrow.getTotalLength(), expectLength1)).toBe(true);

    // path r1 * PI + r2 * PI
    // TODO: 这里箭头位置不对
    pathArrow.attr({
      path: "M 100,300 m -50,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0",
    });
    const expectLength2 = 25 * Math.PI * 2;
    expect(approximate(pathArrow.getBody().getTotalLength(), expectLength2)).toBe(true);
    expect(approximate(pathArrow.getTotalLength(), expectLength2)).toBe(true);

    // polyline
    const expectLength3 = 50 * 4;
    expect(approximate(polylineArrow.getBody().getTotalLength(), expectLength3)).toBe(true);
    expect(approximate(polylineArrow.getTotalLength(), expectLength3)).toBe(true);
  });

  it('getPoint', () => {
    const linePoint = lineArrow.getPoint(0.3);
    expect(linePoint.x).toBe(65);
    expect(linePoint.y).toBe(65);

    const pathPoint = pathArrow.getPoint(1 / 3);
    const expectX = Math.cos(2 * Math.PI / 3) * 25 + 100;
    const expectY = Math.sin(2 * Math.PI / 3) * 25 + 300;
    expect(approximate(pathPoint.x, expectX)).toBe(true);
    expect(approximate(pathPoint.y, expectY)).toBe(true);

    const polylinePoint = polylineArrow.getPoint(0.3);
    expect(polylinePoint.x).toBe(360);
    expect(polylinePoint.y).toBe(150);
  });

  it('getStartTangent getEndTangent', () => {
    const lineTangentStart = lineArrow.getStartTangent();
    const lineTangentEnd = lineArrow.getEndTangent();
    expect(lineTangentStart[0][0]).toBe(100);
    expect(lineTangentStart[1][0]).toBe(50);
    expect(lineTangentEnd[0][0]).toBe(50);
    expect(lineTangentEnd[1][0]).toBe(100);

    const pathTangentStart = pathArrow.getStartTangent();
    const pathTangentEnd = pathArrow.getEndTangent();
    // TODO：可能不对 pathTangentStart 是水平的，pathTangentEnd 是竖直的？？
    expect(pathTangentStart[0][0]).toBe(50);
    expect(pathTangentStart[1][0]).toBe(100);
    expect(approximate(pathTangentEnd[0][1], 291)).toBe(true);
    expect(pathTangentEnd[1][1]).toBe(300);

    const polylineTangentStart = polylineArrow.getStartTangent();
    const polylineTangentEnd = polylineArrow.getEndTangent();
    expect(polylineTangentStart[0][1]).toBe(150);
    expect(polylineTangentStart[1][1]).toBe(100);
    expect(polylineTangentEnd[0][0]).toBe(400);
    expect(polylineTangentEnd[1][0]).toBe(450);
  });
  xit('lineAppendWidth', () => {
    // TODO: 需要事件进行测试
  });
});