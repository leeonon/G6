import { group } from '@antv/util';
import { Renderer } from '@antv/g-canvas';
import { Canvas, Group } from '../../src';

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('shape(marker) test', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  let marker;

  it.only('add marker(rect)', () => {
    const rectMarker = subGroup.addShape('marker', {
      attrs: {
        x: 20,
        y: 20,
        r: 20,
        stroke: '#ccc',
        lineWidth: 1,
        fill: '#666',
        symbol: 'square',
        zIndex: 3
      },
      className: 'class3',
      name: 'markerStr-shape',
      id: 'markerStr-shape'
    });
    expect(rectMarker.get('name')).toBe('markerStr-shape');
    expect(rectMarker.get('id')).toBe('markerStr-shape');

    expect(rectMarker.attr('symbol')).toBe('square');
    const path = rectMarker.attr('path');
    expect(path[0][1]).toBe(0);
    expect(path[0][2]).toBe(0);
    expect(path[1][1]).toBe(40);
    expect(path.length).toBe(5);
  });

  it.only('add marker(diamond)', () => {
    const diamondMarker = subGroup.addShape('marker', {
      attrs: {
        x: 100,
        y: 20,
        r: 20,
        stroke: '#ccc',
        lineWidth: 1,
        fill: '#666',
        symbol: 'diamond',
        zIndex: 3
      },
      className: 'class3',
      name: 'markerStr-shape',
      id: 'markerStr-shape'
    });
    expect(diamondMarker.get('name')).toBe('markerStr-shape');
    expect(diamondMarker.get('id')).toBe('markerStr-shape');

    expect(diamondMarker.attr('symbol')).toBe('diamond');
    const path = diamondMarker.attr('path');
    expect(path[0][1]).toBe(80);
    expect(path[0][2]).toBe(20);
    expect(path[1][1]).toBe(100);
    expect(path.length).toBe(5);
  });

  it.only('add marker(triangle-down)', () => {
    const triangleMarker = subGroup.addShape('marker', {
      attrs: {
        x: 150,
        y: 20,
        r: 20,
        stroke: '#ccc',
        lineWidth: 1,
        fill: '#666',
        symbol: 'triangle-down',
        zIndex: 3
      },
      className: 'class3',
      name: 'markerStr-shape',
      id: 'markerStr-shape'
    });
    expect(triangleMarker.get('name')).toBe('markerStr-shape');
    expect(triangleMarker.get('id')).toBe('markerStr-shape');

    expect(triangleMarker.attr('symbol')).toBe('triangle-down');
    const path = triangleMarker.attr('path');
    expect(path[0][1]).toBe(130);
    expect(path[0][2]).toBe(0);
    expect(path[1][1]).toBe(170);
    expect(path.length).toBe(4);
  });

  it.only('add marker(custom function)', () => {
    const funcMarker = subGroup.addShape('marker', {
      attrs: {
        x: 200,
        y: 20,
        r: 20,
        stroke: '#ccc',
        lineWidth: 1,
        // collapse icon
        symbol: function (x, y, r) {
          return [
            ['M', x - r, y],
            ['a', r, r, 0, 1, 0, r * 2, 0],
            ['a', r, r, 0, 1, 0, -r * 2, 0],
            ['M', x - r / 2, y],
            ['L', x + r / 2, y]
          ];
        },
        zIndex: 3
      },
      className: 'class3',
      name: 'markerStr-shape',
      id: 'markerStr-shape'
    });
    expect(funcMarker.get('name')).toBe('markerStr-shape');
    expect(funcMarker.get('id')).toBe('markerStr-shape');

    expect(funcMarker.attr('symbol')).not.toBe(undefined);
    const path = funcMarker.attr('path');
    expect(path[4][1]).toBe(210);
    expect(path[4][2]).toBe(20);
  });
});