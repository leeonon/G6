import { group } from '@antv/util';
import { Renderer } from '../../node_modules/@antv/g-canvas';
import { Canvas, Group } from '../../src';

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('shape(circle) test', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  let circle, rect;

  it('add circle', () => {
    circle = subGroup.addShape('circle', {
      attrs: {
        r: 10,
        x: 15,
        y: 15,
        fill: '#f00',
        stroke: '#00f',
        lineWidth: 5
      },
      name: 'circle-shape-name',
      id: 'circle-shape-id'
    });
    expect(circle.get('name')).toBe('circle-shape-name');
    expect(circle.get('id')).toBe('circle-shape-id');
  });

  it('attrs attr', () => {
    const attrs = circle.attr();
    expect(attrs.fill).toBe("#f00");
    expect(attrs.x).toBe(15);
    expect(attrs.r).toBe(10);

    circle.style.r = 30;
    circle.attr('fill', '#0f0');
    circle.attr({
      x: 35,
      y: 35
    });
    const attrs2 = circle.attr();
    expect(attrs2.r).toBe(30);
    expect(attrs2.x).toBe(35);
    expect(attrs2.y).toBe(35);
    expect(circle.attr('fill')).toBe('#0f0');
  });

  it('getParent getCanvas', () => {
    expect(circle.getParent()).not.toBe(undefined);
    expect(circle.getCanvas()).not.toBe(undefined);
  });

  it('setMatrix getMatrix applyMatrix resetMatrix', () => {
    const matrix = circle.getMatrix();
    expect(matrix[0]).toBe(1);
    expect(matrix[6]).toBe(35);
    expect(matrix[7]).toBe(35);

    const unitMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    circle.applyMatrix(unitMatrix);
    const matrix2 = circle.getMatrix();
    expect(matrix2[0]).toBe(1);
    expect(matrix2[6]).toBe(0);
    expect(matrix2[7]).toBe(0);

    const scaleMoveMatrix = [2, 0, 0, 0, 2, 0, 70, 70, 1];
    circle.setMatrix(scaleMoveMatrix);
    const matrix3 = circle.getMatrix();
    expect(matrix3[0]).toBe(2);
    expect(matrix3[6]).toBe(70);
    expect(matrix3[7]).toBe(70);

    expect(circle.attr('x')).toBe(35);
    expect(circle.attr('y')).toBe(35);

    circle.resetMatrix();
    const matrix4 = circle.getMatrix();
    expect(matrix4[0]).toBe(1);
    expect(matrix4[6]).toBe(0);
    expect(matrix4[7]).toBe(0);
    expect(circle.attr('x')).toBe(35);
    expect(circle.attr('y')).toBe(35);

    circle.setMatrix(scaleMoveMatrix);
  });

  // TODO: zIndex 存在问题
  xit('toFront toBack, set zIndex, add rect with rotate', () => {
    rect = subGroup.addShape('rect', {
      attrs: {
        width: 100,
        height: 50,
        x: 50,
        y: 25,
        fill: '#f00',
        rotate: Math.PI / 4
      },
      zIndex: -10
    });
    expect(approximate(rect.getLocalEulerAngles(), 45)).toBe(true);
    expect(rect.get('zIndex')).toBe(-10);

    circle.set('zIndex', -11);
    expect(circle.get('zIndex')).toBe(-11);

    circle.toFront();
    expect(circle.get('zIndex')).toBe(-9);
    circle.toBack();
    expect(circle.get('zIndex')).toBe(-11);
  });

  it('set/get: capture, visible', () => {
    circle.set('visible', false);
    expect(circle.style.visibility).toBe('hidden');
    expect(circle.get('visible')).toBe(false);
    circle.set('visible', true);
    expect(circle.style.visibility).toBe('visible');
    expect(circle.get('visible')).toBe(true);

    circle.set('capture', false);
    expect(circle.interactive).toBe(false);
    expect(circle.get('capture')).toBe(false);
    circle.set('capture', true);
    expect(circle.interactive).toBe(true);
    expect(circle.get('capture')).toBe(true);
  });

  it('getBBox getCanvasBBox', () => {
    const bbox = circle.getBBox();
    const canvasBBox = circle.getCanvasBBox();
    Object.keys(bbox).forEach(key => {
      expect(bbox[key]).toBe(canvasBBox[key] / 2);
    });

    // set group matrix
    subGroup.setMatrix([2, 0, 0, 0, 2, 0, 100, 200, 1]);
    const bbox2 = circle.getBBox();
    const canvasBBox2 = circle.getCanvasBBox();
    // bbox 不变
    Object.keys(bbox).forEach(key => {
      expect(bbox[key]).toBe(bbox2[key]);
    });
    // canvasBBox 变化
    expect(canvasBBox2.x).toBe(120);
    expect(canvasBBox2.y).toBe(220);
    expect(canvasBBox2.minX).toBe(120);
    expect(canvasBBox2.minY).toBe(220);
    expect(canvasBBox2.maxX).toBe(360);
    expect(canvasBBox2.maxY).toBe(460);
  });

  it('isCanvas', () => {
    expect(circle.isCanvas()).toBe(false);
  })

  it('on off', () => {
    let clickCount = 0;
    circle.on('click', e => clickCount++);
    circle.emit('click', {});
    expect(clickCount).toBe(1);
    circle.off('click');
    circle.emit('click', {});
    expect(clickCount).toBe(1);
  });

  // TODO: 待 zIndex 单测通过后打开
  xit('rotateAtStart rotateAtPoint', () => {
    subGroup.resetMatrix();
    rect.rotateAtStart(Math.PI / 4);
    expect(approximate(rect.getLocalEulerAngles(), 90)).toBe(true);

    rect.rotateAtPoint(50, 25, Math.PI / 2);
    expect(approximate(rect.getLocalEulerAngles(), -180)).toBe(true);
    const bbox = rect.getBBox();
    expect(approximate(bbox.x, 50)).toBe(true);
    expect(approximate(bbox.y, 25)).toBe(true);
    expect(approximate(bbox.maxX, 150)).toBe(true);
    expect(approximate(bbox.maxY, 75)).toBe(true);
  });

  it('setClip getClip', () => {
    const clipShape = circle.setClip({
      type: 'rect',
      attrs: {
        x: 0,
        y: -20,
        width: 30, // 从圆心切到不包含描边的边缘
        height: 35 + 20 // 从圆心 - 20 切到包含描边的边缘
      }
    });
    expect(clipShape.config.type).toBe('rect');
    expect(clipShape.attr('x')).toBe(0);
    expect(clipShape.attr('height')).toBe(55);

    const getClipShape = circle.getClip();
    expect(getClipShape.config.type).toBe('rect');
    expect(getClipShape.attr('x')).toBe(0);
    expect(getClipShape.attr('height')).toBe(55);
  });

  it('moveTo', () => {
    const { x: beforeX, y: beforeY } = circle.getCanvasBBox();
    const matrix1 = circle.getMatrix()
    expect(matrix1[6]).toBe(70);
    expect(matrix1[7]).toBe(70);
    circle.moveTo(0, 0);
    const { x: afterX, y: afterY } = circle.getCanvasBBox();
    expect(beforeX - afterX).toBe(240);
    expect(beforeY - afterY).toBe(340);
    const matrix2 = circle.getMatrix();
    expect(matrix2[6]).toBe(-50);
    expect(matrix2[7]).toBe(-100);
  });
});