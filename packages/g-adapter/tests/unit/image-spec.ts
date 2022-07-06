import { Renderer } from '@antv/g-canvas';
import { Canvas, Group } from '../../src';

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('image test', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  let image, rect;

  it('add circle', () => {
    image = subGroup.addShape('image', {
      attrs: {
        width: 100,
        height: 150,
        x: 50,
        y: 100,
        img: 'https://g.alicdn.com/cm-design/arms-trace/1.0.155/styles/armsTrace/images/TAIR.png',
      },
      name: 'image-shape-name',
      id: 'image-shape-id'
    });
    expect(image.get('name')).toBe('image-shape-name');
    expect(image.get('id')).toBe('image-shape-id');
  });

  it('attrs attr', () => {
    const attrs = image.attr();
    expect(attrs.x).toBe(50);
    expect(attrs.y).toBe(100);

    image.attr({
      x: 80,
      y: 100,
      width: 40,
      height: 50
    });
    const attrs2 = image.attr();
    expect(attrs2.x).toBe(80);
    expect(attrs2.y).toBe(100);
    expect(attrs2.width).toBe(40);
    expect(attrs2.height).toBe(50);
  });

  it('getParent getCanvas', () => {
    expect(image.getParent()).not.toBe(undefined);
    expect(image.getCanvas()).not.toBe(undefined);
  });

  it('setMatrix getMatrix applyMatrix resetMatrix', () => {
    const matrix = image.getMatrix();
    expect(matrix[0]).toBe(1);
    expect(matrix[6]).toBe(80);
    expect(matrix[7]).toBe(100);

    const unitMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    image.applyMatrix(unitMatrix);
    const matrix2 = image.getMatrix();
    expect(matrix2[0]).toBe(1);
    expect(matrix2[6]).toBe(0);
    expect(matrix2[7]).toBe(0);

    const scaleMoveMatrix = [2, 0, 0, 0, 2, 0, 70, 70, 1];
    image.setMatrix(scaleMoveMatrix);
    const matrix3 = image.getMatrix();
    expect(matrix3[0]).toBe(2);
    expect(matrix3[6]).toBe(70);
    expect(matrix3[7]).toBe(70);

    expect(image.attr('x')).toBe(70);
    expect(image.attr('y')).toBe(70);

    image.resetMatrix();
    const matrix4 = image.getMatrix();
    expect(matrix4[0]).toBe(1);
    expect(matrix4[6]).toBe(0);
    expect(matrix4[7]).toBe(0);

    image.setMatrix(scaleMoveMatrix);
  });

  it('on off', () => {
    let clickCount = 0;
    image.on('click', e => clickCount++);
    image.emit('click', {});
    expect(clickCount).toBe(1);
    image.off('click');
    image.emit('click', {});
    expect(clickCount).toBe(1);
  });

  it('rotateAtStart rotateAtPoint', () => {
    subGroup.resetMatrix();
    image.rotateAtStart(Math.PI / 4);
    expect(approximate(image.getLocalEulerAngles(), 45)).toBe(true);

    image.rotateAtPoint(20, 25, Math.PI / 2 + Math.PI / 4);
    expect(approximate(image.getLocalEulerAngles(), 180)).toBe(true);
    const bbox = image.getBBox();
    expect(approximate(bbox.x, 50)).toBe(true);
    expect(approximate(bbox.y, 45)).toBe(true);
    expect(approximate(bbox.maxX, 130)).toBe(true);
    expect(approximate(bbox.maxY, 145)).toBe(true);
  });

  it('setClip getClip', () => {
    const clipShape = image.setClip({
      type: 'circle',
      attrs: {
        x: 20,
        y: 25,
        r: 20,
      }
    });
    expect(clipShape.config.type).toBe('circle');
    expect(clipShape.attr('x')).toBe(20);
    expect(clipShape.attr('r')).toBe(20);

    const getClipShape = image.getClip();
    expect(getClipShape.config.type).toBe('circle');
    expect(getClipShape.attr('x')).toBe(20);
    expect(getClipShape.attr('r')).toBe(20);
  });
});