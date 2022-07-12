import { Canvas, Group } from '../../src';
import { Circle } from '../../src/shapes';
import { Circle as GCirlce } from '@antv/g';
import { Renderer } from '@antv/g-canvas';
import { createShape } from '../../src/utils/shape';

const div = document.createElement('div');
div.id = 'select-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('group test', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });

  // addGroup
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });

  let clonedGroup, testCircle;
  it.only('group id', () => {
    expect(subGroup.get('id')).toBe('sub-group');
    expect(rootGroup.adaptedEle.childNodes[0].get('id')).toBe('sub-group');
  });

  it.only('addShape', () => {
    // addShape
    // circle
    const circle = subGroup.addShape('circle', {
      attrs: {
        r: 10,
        fill: '#f00',
        x: 100,
        y: 100,
        zIndex: 6
      },
      className: 'class1',
      name: 'circle-shape',
      id: 'circle-shape'
    });
    testCircle = circle;
    expect(circle.get('name')).toBe('circle-shape');
    expect(circle.get('id')).toBe('circle-shape');
    expect(circle.get('className')).toBe('class1');
    // rect
    const rect = subGroup.addShape('rect', {
      attrs: {
        width: 10,
        height: 20,
        fill: '#f00',
        stroke: '#0f0',
        lineWidth: 2,
        x: 200,
        y: 100,
        zIndex: -1
      },
      className: 'class2',
      name: 'rect-shape',
      id: 'rect-shape'
    });
    expect(rect.get('name')).toBe('rect-shape');
    expect(rect.get('id')).toBe('rect-shape');
    expect(rect.get('className')).toBe('class2');
    // ellipse
    const ellipse = subGroup.addShape('ellipse', {
      attrs: {
        x: 300,
        y: 100,
        rx: 50,
        ry: 10,
        fill: 'blue',
        zIndex: 5
      },
      className: 'class1',
      name: 'ellipse-shape',
      id: 'ellipse-shape'
    });
    expect(ellipse.get('name')).toBe('ellipse-shape');
    expect(ellipse.get('id')).toBe('ellipse-shape');
    expect(ellipse.get('className')).toBe('class1');
    // text
    const text = subGroup.addShape('text', {
      attrs: {
        text: 'test text',
        fill: 'red',
        fontWeight: 400,
        shadowOffsetX: 10,
        shadowOffsetY: 10,
        shadowColor: 'white',
        shadowBlur: 10,
        x: 100,
        y: 200,
        zIndex: 0
      },
      className: 'class2',
      name: 'text-shape',
      id: 'text-shape'
    });
    expect(text.get('name')).toBe('text-shape');
    expect(text.get('id')).toBe('text-shape');
    expect(text.get('className')).toBe('class2');
    // path
    const path = subGroup.addShape('path', {
      attrs: {
        startArrow: {
          path: 'M 0,0 L 20,10 L 20,-10 Z',
        },
        endArrow: {
          path: 'M 0,0 L 20,10 L 20,-10 Z',
        },
        path: [
          ['M', 100, 100],
          ['L', 200, 200],
          ['L', 300, 200],
        ],
        stroke: '#fff',
        lineWidth: 8,
        lineAppendWidth: 5,
        zIndex: 1
      },
      className: 'class2',
      name: 'path-shape',
      id: 'path-shape'
    });
    expect(path.get('name')).toBe('path-shape');
    expect(path.get('id')).toBe('path-shape');
    expect(path.get('className')).toBe('class2');
    // image
    const image = subGroup.addShape('image', {
      attrs: {
        x: 300,
        y: 200,
        width: 50,
        height: 50,
        img: 'https://g.alicdn.com/cm-design/arms-trace/1.0.155/styles/armsTrace/images/TAIR.png',
        zIndex: 4
      },
      className: 'image-shape-cln',
      name: 'image-shape',
      id: 'image-shape'
    });
    expect(image.get('name')).toBe('image-shape');
    expect(image.get('id')).toBe('image-shape');
    expect(image.get('className')).toBe('image-shape-cln');
    // TODO: image clip
    // marker
    const markerStr = subGroup.addShape('marker', {
      attrs: {
        x: 50,
        y: 300,
        r: 20,
        stroke: '#ccc',
        lineWidth: 1,
        fill: '#666',
        symbol: 'circle',
        zIndex: 3
      },
      className: 'class3',
      name: 'markerStr-shape',
      id: 'markerStr-shape'
    });
    expect(markerStr.get('name')).toBe('markerStr-shape');
    expect(markerStr.get('id')).toBe('markerStr-shape');
    expect(markerStr.get('className')).toBe('class3');
    expect(markerStr.attr('path')[0][1]).toBe(30);
    expect(markerStr.attr('path')[0][2]).toBe(300);
    expect(markerStr.attr('path')[1][1]).toBe(20);
    const markerFunc = subGroup.addShape('marker', {
      attrs: {
        x: 150,
        y: 300,
        r: 10,
        stroke: '#ccc',
        lineWidth: 1,
        symbol: (x, y, r) => [
          ['M', x - r, y],
          ['a', r, r, 0, 1, 0, r * 2, 0],
          ['a', r, r, 0, 1, 0, -r * 2, 0],
          ['M', x - r + 4, y],
          ['L', x + r - 4, y],
        ],
        zIndex: 10
      },
      className: 'class3',
      name: 'markerFunc-shape',
      id: 'markerFunc-shape',
    });
    expect(markerFunc.get('name')).toBe('markerFunc-shape');
    expect(markerFunc.get('id')).toBe('markerFunc-shape');
    expect(markerFunc.get('className')).toBe('class3');
    expect(markerFunc.attr('path')[4][1]).toBe(156); // ['L', x + r - 4, y],
    expect(markerFunc.attr('path')[4][2]).toBe(300);
  });

  it.only('sort', () => {
    // sort
    subGroup.sort();
    // const shapes = [markerFunc, circle, ellipse, image, markerStr, path, text, rect];
    // shapes.forEach(shape => {
    //   if (shape.get('name').includes('path')) {}
    //   else {
    //     shape.attr({
    //       x: 100,
    //       y: 100
    //     })
    //   }
    // });
    // markerFunc 10, circle 6, ellipse 5, image 4, markerStr 3,  path 1, text 0, rect -1
    // 排序结果无法从 subGroup.get('children') 的数组顺序中看出，该数组顺序还是原顺序，只能通过视图来看
  });
  it.only('get children', () => {
    // get('children')
    expect(subGroup.get('children').length).toBe(8);
  });
  it.only('find apis', () => {
    // find
    expect(subGroup.find(ele => ele.get('name') === 'ellipse-shape').get('id')).toBe('ellipse-shape');
    expect(subGroup.find(ele => ele.get('name') === 'rect-shape').get('id')).toBe('rect-shape');

    // findAll
    expect(subGroup.findAll(ele => ele.get('className') === 'class1').length).toBe(2);
    expect(subGroup.findAll(ele => ele.get('className') === 'class2').length).toBe(3);
    expect(subGroup.findAll(ele => ele.get('className') === 'class3').length).toBe(2);

    // findById
    expect(subGroup.findById('markerFunc-shape').get('name')).toBe('markerFunc-shape');
    expect(subGroup.findById('path-shape').get('name')).toBe('path-shape');

    // findAllByName findByClassName
    expect(subGroup.findAllByName('markerFunc-shape').length).toBe(1);
    expect(subGroup.findByClassName('class1')).not.toBe(undefined);

    // getFirst getLast
    expect(subGroup.getFirst().get('name')).toBe('circle-shape');
    expect(subGroup.getLast().get('name')).toBe('markerFunc-shape');

    // getChildByIndex
    expect(subGroup.getChildByIndex(0).get('name')).toBe('circle-shape');
    expect(subGroup.getChildByIndex(1).get('name')).toBe('rect-shape');

    // getCount
    expect(subGroup.getCount()).toBe(8);

    // contain
    expect(subGroup.contain(testCircle)).toBe(true);

  });
  // 图形、group 上的 setMatrix getMatrix 还是直接用 G 的。graph 上的全局矩阵操作使用 G 相机相关操作（如平移、缩放）
  it.only('matrix apis', () => {
    // getMatrix setMatrix applyMatrix
    const initMatrix = subGroup.getMatrix();
    // 初始矩阵为单位阵
    expect(initMatrix[0]).toBe(1);
    expect(initMatrix[1]).toBe(0);
    expect(initMatrix[2]).toBe(0);
    expect(initMatrix[4]).toBe(1);
    expect(initMatrix[8]).toBe(1);

    // 最后一位 set 不成功，不过最后一位没什么用
    const translateMatrix = [2, 0, 0, 0, 2, 0, 10, 50, 1];
    subGroup.setMatrix(translateMatrix);
    const matrixAfterSet = subGroup.getMatrix();
    expect(matrixAfterSet[0]).toBe(2);
    expect(matrixAfterSet[1]).toBe(0);
    expect(matrixAfterSet[2]).toBe(0);
    expect(matrixAfterSet[4]).toBe(2);
    expect(matrixAfterSet[6]).toBe(10);
    expect(matrixAfterSet[7]).toBe(50);
    expect(matrixAfterSet[8]).toBe(1);

    subGroup.setMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    const matrix3 = subGroup.getMatrix(); // [1, 0, 0, 0, 1, 0, 0, 0, 1];
    expect(matrix3[0]).toBe(1);
    expect(matrix3[4]).toBe(1);
    expect(matrix3[6]).toBe(0);
    expect(matrix3[7]).toBe(0);
    expect(matrix3[8]).toBe(1);
  });
  it.only('bbox apis', () => {
    // getCanvasBBox getBBox
    let canvasBBox = subGroup.getCanvasBBox();
    expect(canvasBBox.minX).toBe(30);
    expect(canvasBBox.minY).toBe(90);
    expect(canvasBBox.maxX).toBe(350);
    expect(canvasBBox.maxY).toBe(320);

    let bbox = subGroup.getBBox();
    // 没设置矩阵之前， bbox 和 canvasBBox 是一样的
    expect(bbox.minX).toBe(30);
    expect(bbox.minY).toBe(90);
    expect(bbox.maxX).toBe(350);
    expect(bbox.maxY).toBe(320);

    // 旋转/平移/缩放之后的 canvasBBox 和 bbox 还是一样的？
    subGroup.translate(100, 0);
    subGroup.scale(2, 2);
    canvasBBox = subGroup.getCanvasBBox();
    expect(canvasBBox.minX).toBe(160);
    expect(canvasBBox.minY).toBe(180);
    expect(canvasBBox.maxX).toBe(800);
    expect(canvasBBox.maxY).toBe(640);
    bbox = subGroup.getBBox();
    expect(bbox.minX).toBe(160);
    expect(bbox.minY).toBe(180);
    expect(bbox.maxX).toBe(800);
    expect(bbox.maxY).toBe(640);
  });
  it.only('isCanvas', () => {
    // isCanvas
    expect(subGroup.isCanvas()).toBe(false);
  });
  it.only('clone', () => {
    // clone
    const cfg = {
      attrs: {
        r: 10,
        fill: '#f00',
        x: 10,
        y: 10,
        zIndex: 6
      },
      id: 'ori-id',
    };
    // clone circle
    const circle = subGroup.addShape('circle', cfg)
    // const circle = new Circle(cfg)
    expect(circle.get('id')).toBe('ori-id');
    // subGroup.appendChild(circle);
    const clonedCircle = circle.clone();
    expect(clonedCircle.get('id')).toBe('cloned-ori-id');
    expect(circle.get('id')).toBe('ori-id');
    subGroup.appendChild(clonedCircle);

    // 修改原图形属性，不影响被克隆的图形的属性
    circle.attr('fill', '#0f0');
    expect(circle.attr('fill')).toBe('#0f0');
    expect(clonedCircle.attr('fill')).toBe('#f00');
    // 修改被克隆的图形的属性，不影响原图形属性
    clonedCircle.attr({
      x: 20,
      y: 20,
    });
    expect(circle.attr('x')).toBe(10);
    expect(circle.attr('y')).toBe(10);
    subGroup.removeChild(circle, false);
    subGroup.removeChild(clonedCircle, true);
    expect(subGroup.getCount()).toBe(8);
    expect(circle.destroyed).toBe(false);
    expect(clonedCircle.destroyed).toBe(true);

    // TODO: 待G确认，复制内容位置、缩放不对
    clonedGroup = subGroup.clone();
    rootGroup.appendChild(clonedGroup);
    clonedGroup.adaptedEle.style.transform = 'translate(-50px, -100px)';
    clonedGroup.scale(2, 2);
    clonedGroup.translate(-100, -150);

    // 对复制的 group 操作不影响原 group
    const canvasBBox = subGroup.getCanvasBBox();
    expect(canvasBBox.minX).toBe(160);
    expect(canvasBBox.minY).toBe(180);
    expect(canvasBBox.maxX).toBe(800);
    expect(canvasBBox.maxY).toBe(640);
    const bbox = subGroup.getBBox();
    expect(bbox.minX).toBe(160);
    expect(bbox.minY).toBe(180);
    expect(bbox.maxX).toBe(800);
    expect(bbox.maxY).toBe(640);
  });
  it.only('addGroup', () => {
    const subSubGroup = subGroup.addGroup({ id: 'sub-sub-group' });
    expect(subSubGroup.get('id')).toBe('sub-sub-group');
  });
  it.only('on and off', () => {
    let clickCount = 0;
    subGroup.on('click', e => clickCount++);
    subGroup.emit('click', {});
    expect(clickCount).toBe(1);
    subGroup.off('click');
    subGroup.emit('click', {});
    expect(clickCount).toBe(1);
  });
  it.only('set capture and visible', () => {
    let clickCount = 0;
    // const circle = subGroup.find(e => e.get('name') === 'circle-shape');
    subGroup.on('click', e => {
      clickCount++;
    });
    subGroup.emit('click', {});
    expect(clickCount).toBe(1);

    // capture 无法阻止 emit，只能通过表现测试
    subGroup.set('capture', false);
    // subGroup.emit('click', {});
    // expect(clickCount).toBe(1);

    subGroup.set('visible', false);
    expect(subGroup.get('visible')).toBe(false);
    expect(subGroup.adaptedEle.attributes.visibility).toBe('hidden');
    subGroup.set('visible', true);
    expect(subGroup.get('visible')).toBe(true);
    expect(subGroup.adaptedEle.attributes.visibility).toBe('visible');
  });
  it.only('getParent getCanvas', () => {
    expect(subGroup.getCanvas()).not.toBe(undefined);
    expect(subGroup.getParent().get('id')).toBe('root-group');
    expect(subGroup.getParent().getParent().get('id')).toBe('g-root');
  });
  it.only('toFront toBack', () => {
    clonedGroup.translate(0, 100);
    clonedGroup.toBack();
    // expect(subGroup.adaptedEle.style.zIndex).toBe(0);
    // expect(subGroup.get('zIndex')).toBe(0);
    // expect(clonedGroup.adaptedEle.style.zIndex).toBe(-1);
    // expect(clonedGroup.get('zIndex')).toBe(-1);
    // clonedGroup.toFront();
    // expect(subGroup.adaptedEle.style.zIndex).toBe(0);
    // expect(subGroup.get('zIndex')).toBe(0);
    // expect(clonedGroup.adaptedEle.style.zIndex).toBe(1);
    // expect(clonedGroup.get('zIndex')).toBe(1);
  });
  it.only('moveTo', () => {
    const { x: beforeX, y: beforeY } = subGroup.getCanvasBBox();
    const matrix1 = subGroup.getMatrix()
    expect(matrix1[6]).toBe(100);
    expect(matrix1[7]).toBe(0);
    subGroup.moveTo(0, 0);
    const { x: afterX, y: afterY } = subGroup.getCanvasBBox();
    expect(beforeX - afterX).toBe(100);
    expect(beforeY - afterY).toBe(0);
    const matrix2 = subGroup.getMatrix();
    expect(matrix2[6]).toBe(0);
    expect(matrix2[7]).toBe(0);
  });
  // it('find apis', () => {});
  it.only('clear', () => {
    clonedGroup.setMatrix([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    expect(clonedGroup.get('children').length).toBe(8);
    clonedGroup.clear();
    expect(clonedGroup.get('children').length).toBe(0);
  });
});