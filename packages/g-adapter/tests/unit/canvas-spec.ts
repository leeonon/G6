import { Canvas, Group } from '../../src';
// TODO: 暂时先从 node_modules 引入避免引用到最外层的 node_modules
import { Renderer } from '@antv/g-canvas';

const div = document.createElement('div');
div.id = 'select-spec';
document.body.appendChild(div);

describe('canvas test', () => {
  it.only('canvas test', () => {
    // const renderer = new Renderer();
    const canvas = new Canvas({
      container: div,
      renderer: 'Canvas',
      width: 500,
      height: 600,
      devicePixelRatio: 1
    });

    // addGroup
    const rootGroup = canvas.addGroup({ id: 'root-group' });
    expect(rootGroup).not.toBe(undefined);
    expect(rootGroup.get('id')).toBe('root-group');
    expect(canvas.adaptedEle.childNodes[0].get('id')).toBe('root-group');

    // get('el')
    expect(canvas.get('el')).not.toBe(undefined);
    // expect(canvas.get('el').getBoundingClientRect()).not.toBe(undefined);

    // isCanvas
    expect(canvas.isCanvas()).toBe(true);

    // changeSize pixelRatio
    expect(canvas.get('el').width).toBe(500);
    expect(canvas.get('el').height).toBe(600);
    rootGroup.addShape('circle', {
      attrs: {
        r: 10,
        x: 10,
        y: 10,
        fill: '#f00'
      }
    });
    rootGroup.addShape('circle', {
      attrs: {
        r: 10,
        x: 100,
        y: 200,
        fill: '#0f0'
      }
    });
    canvas.changeSize(100, 200);
    expect(canvas.get('el').width).toBe(100);
    expect(canvas.get('el').height).toBe(200);

    // renderer
    expect(canvas.getRenderer()).toBe('Canvas');

    // getCursor setCursor
    expect(canvas.getCursor()).toBe('default');
    canvas.setCursor('pointer');
    expect(canvas.getCursor()).toBe('pointer');

    // on once off
    let clickCount = 0;
    const func = () => clickCount++;
    canvas.on('click', func);
    canvas.emit('click', {});
    expect(clickCount).toBe(1);

    canvas.off('click', func);
    canvas.emit('click', {});
    expect(clickCount).toBe(1);

    canvas.once('click', func);
    canvas.emit('click', {});
    canvas.emit('click', {});
    expect(clickCount).toBe(2);


    // destroyed
    expect(canvas.destroyed).toBe(false);
    canvas.destroy();
    expect(canvas.destroyed).toBe(true);

  });
});