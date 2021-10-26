import { Canvas } from '../../src';
import { Renderer } from '@antv/g-canvas';

const div = document.createElement('div');
div.id = 'select-spec';
document.body.appendChild(div);

describe('canvas test', () => {
  it ('canvas test', () => {
    const renderer = new Renderer();
    const canvas = new Canvas({
      container: div,
      renderer
    });

    // addGroup
    const rootGroup = canvas.addGroup({ id: 'root-group' });
    expect(rootGroup).not.toBe(undefined);
    expect(rootGroup.get('id')).toBe('root-group');
    expect(canvas.document.children[0].get('id')).toBe('root-group');

    // get('el')
    expect(canvas.get('el')).not.toBe(undefined);
    // expect(canvas.get('el').getBoundingClientRect()).not.toBe(undefined);


    // destroyed
    expect(canvas.destroyed).toBe(false);
    canvas.destroy();
    expect(canvas.destroyed).toBe(true);

    
    console.log('canvas', canvas, rootGroup); 
    console.log('canvas el', canvas.get('el'))
    console.log('canvas el bbox', canvas.get('el').getBoundingClientRect())
  });
});