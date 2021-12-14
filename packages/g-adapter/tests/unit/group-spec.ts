import { Canvas, Group } from '../../src';
import { Circle } from '../../src/shapes';
import { Circle as GCirlce } from '@antv/g';
import { Renderer } from '@antv/g-canvas';

const div = document.createElement('div');
div.id = 'select-spec';
document.body.appendChild(div);

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
  console.log('subGroup', subGroup, rootGroup);
  it ('group id', () => {
    expect(subGroup.get('id')).toBe('sub-group');
    expect(rootGroup.childNodes[0].get('id')).toBe('sub-group');
  });

  it('addShape', () => {
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
    console.log('circle', circle, circle.attr())
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
    console.log('rect', rect, rect.attr())
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
    console.log('ellipse', ellipse, ellipse.attr())
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
    console.log('text', text, text.attr())
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
    console.log('path', path, path.attr())
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
    console.log('image', image, image.attr())
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
    console.log('markerStr', markerStr, markerStr.attr())
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
    console.log('markerFunc', markerFunc, markerFunc.attr())
    expect(markerFunc.get('name')).toBe('markerFunc-shape');
    expect(markerFunc.get('id')).toBe('markerFunc-shape');
    expect(markerFunc.get('className')).toBe('class3');
    expect(markerFunc.attr('path')[4][1]).toBe(156); // ['L', x + r - 4, y],
    expect(markerFunc.attr('path')[4][2]).toBe(300);
  });

  it ('sort', () => {
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
  it('get children', () => {
    // get('children')
    expect(subGroup.get('children').length).toBe(8);
  });
  it('find apis', () => {
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

    // findAllByName
    expect(subGroup.findAllByName('markerFunc-shape').length).toBe(1);
  });
  // TODO: 矩阵相关待实现
  it('matrix apis', () => {
    // getMatrix setMatrix applyMatrix. TODO: setMatrix 待实现
    const initMatrix = subGroup.getMatrix();
    // 初始矩阵为单位阵
    expect(initMatrix[0]).toBe(1);
    expect(initMatrix[1]).toBe(0);
    expect(initMatrix[2]).toBe(0);
    expect(initMatrix[4]).toBe(1);
    expect(initMatrix[8]).toBe(1);
    
    const translateMatrix = [1, 0, 0, 0, 1, 0, 10, 50, 1];
    subGroup.setMatrix(translateMatrix);
  });
  it('bbox apis', () => {
    // getCanvasBBox getBBox
    let canvasBBox = subGroup.getCanvasBBox();
    console.log('canvasBBox', canvasBBox);
    expect(canvasBBox.minX).toBe(40);
    expect(canvasBBox.minY).toBe(140);
    expect(canvasBBox.maxX).toBe(360);
    expect(canvasBBox.maxY).toBe(370);
    
    let bbox = subGroup.getBBox();
    // // 没设置矩阵之前， bbox 和 canvasBBox 是一样的
    expect(bbox.minX).toBe(40);
    expect(bbox.minY).toBe(140);
    expect(bbox.maxX).toBe(360);
    expect(bbox.maxY).toBe(370);
    console.log('bbox', bbox);

    // 旋转/平移/缩放之后的 canvasBBox 和 bbox 还是一样的？
    subGroup.translate(100, 0);
    subGroup.scale(2, 2);
    canvasBBox = subGroup.getCanvasBBox();
    expect(canvasBBox.minX).toBe(170);
    expect(canvasBBox.minY).toBe(230);
    expect(canvasBBox.maxX).toBe(810);
    expect(canvasBBox.maxY).toBe(690);
    bbox = subGroup.getBBox();
    expect(bbox.minX).toBe(170);
    expect(bbox.minY).toBe(230);
    expect(bbox.maxX).toBe(810);
    expect(bbox.maxY).toBe(690);
    console.log('bboxes after translate', canvasBBox, bbox);
    

    // rootGroup.addShape('rect', {
    //   attrs: {
    //     width: bbox.maxX - bbox.minX,
    //     height: bbox.maxY - bbox.minY,
    //     x: bbox.x,
    //     y: bbox.y,
    //     fill: '#ccc',
    //     opacity: 0.1
    //   }
    // });
  });
  it('isCanvas', () => {
    // isCanvas
    expect(subGroup.isCanvas()).toBe(false);
  });
  it('clone', () => {
    // clone

    const cfg = {
      style: {
        r: 10,
        fill: '#f00',
        x: 10,
        y: 10,
        zIndex: 6
      },
      id: 'ori-id'
    };

    
    // // clone circle
    // const circle = new Circle(cfg)
    // expect(circle.get('id')).toBe('ori-id');
    // subGroup.appendChild(circle);
    // const clonedCircle = circle.clone('clonep1', 'p2');
    // expect(clonedCircle.get('id')).toBe('cloned-ori-id');
    // subGroup.appendChild(clonedCircle);

    // // 修改原图形属性，不影响被克隆的图形的属性
    // circle.style.fill = '#0f0';
    // expect(circle.style.fill).toBe('#0f0');
    // expect(clonedCircle.style.fill).toBe('#f00');
    // // 修改被克隆的图形的属性，不影响原图形属性
    // clonedCircle.style.x = 20;
    // clonedCircle.style.y = 20;
    // expect(circle.style.x).toBe(10);
    // expect(circle.style.y).toBe(10);


    // const div2 = document.createElement('div');
    // div2.id = 'select-spec2';
    // document.body.appendChild(div2);
    // const renderer2 = new Renderer();
    // const canvas2 = new Canvas({
    //   container: div2,
    //   renderer: renderer2,
    //   width: 500,
    //   height: 500
    // });

    // TODO: 待G确认，复制内容位置、缩放不对
    const clonedGroup = subGroup.clone();
    rootGroup.appendChild(clonedGroup);
    // clonedGroup.style.transform = 'translate(-50px, -100px)';
    // clonedGroup.scale(2, 2);
    // clonedGroup.translate(-100, -150);
    console.log('clonedGroup', clonedGroup, clonedGroup.transformable, subGroup.transformable);
    // subGroup.set('id', '1111111');
    // console.log('clonedGroup', clonedGroup)
  });
  it('addGroup', () => {
    const subSubGroup = subGroup.addGroup({ id: 'sub-sub-group' });
    expect(subSubGroup.get('id')).toBe('sub-sub-group');
  });
  it('on', () => {
    // on
  });
  it('animate', () => {
    // animate
  });
  it('clear', () => {
    // clear
  })
});