import { group } from '@antv/util';
import { Renderer } from '@antv/g-canvas';
import { Canvas, Group } from '../../src';

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('shape(text) test', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  let text;

  it('add text', () => {
    text = subGroup.addShape('text', {
      attrs: {
        x: 20,
        y: 20,
        text: 'abcddd',
        fill: '#ccc',
      },
      name: 'text-shape',
      id: 'text-shape'
    });

    expect(text.get('name')).toBe('text-shape');
    expect(text.get('id')).toBe('text-shape');

    expect(text.attr('text')).toBe('abcddd');

    text.attr({ text: '1123112' });
    expect(text.attr('text')).toBe('1123112');

    text.attr('text', 'asdf12w3');
    expect(text.attr('text')).toBe('asdf12w3');

    const bbox = text.getBBox();
    expect(bbox.x).toBe(20);
    expect(bbox.y).toBe(5);
    expect(approximate(bbox.maxX - bbox.minX, 70)).toBe(true);
    expect(bbox.maxY - bbox.minY).toBe(19);

    subGroup.addShape('circle', {
      attrs: {
        x: 20,
        y: 20,
        r: 1,
        fill: '#f00',
      }
    });
  });

  it('textAlign textBaseline', () => {
    // textAlign 默认是 left
    text.attr('textAlign', 'center');
    let bbox = text.getBBox();
    expect(bbox.x).toBe(20 - (bbox.maxX - bbox.minX) / 2);
    text.attr('textAlign', 'right');
    bbox = text.getBBox();
    expect(bbox.x).toBe(20 - (bbox.maxX - bbox.minX));

    // textBaseline 默认是 'bottom'
    text.attr('textBaseline', 'top');
    bbox = text.getBBox();
    expect(bbox.y).toBe(20);
    text.attr('textBaseline', 'middle');
    bbox = text.getBBox();
    expect(bbox.y).toBe(20 - (bbox.maxY - bbox.minY) / 2);
  });

  it('rotateAtStart rotateAtPoint', () => {
    // 恢复以方便测试
    text.attr({
      textAlign: 'left',
      textBaseline: 'bottom'
    });

    text.rotateAtStart(Math.PI / 2);
    const bbox = text.getBBox();
    expect(approximate(bbox.maxX - bbox.minX, 19)).toBe(true);
    expect(approximate(bbox.maxY - bbox.minY, 70)).toBe(true);

    // TODO: 恢复到原状了，有点奇怪
    text.rotateAtPoint(5, 10, -Math.PI / 2);
  });

  it('letterSpacing', () => {
    // 恢复以方便测试
    text.resetMatrix();
    let bbox = text.getBBox();
    const widthBefore = bbox.maxX - bbox.minX;
    text.attr('letterSpacing', 10);
    bbox = text.getBBox();
    // 7 个间隙，宽度增加 70
    expect(bbox.maxX - bbox.minX).toBe(widthBefore + 70)
  });

  it('shadow', () => {
    text.attr({
      shadowColor: '#f00',
      shadowBlur: 10,
    });
    expect(text.attr('shadowColor')).toBe('#f00');
  });

  it('stroke', () => {
    text.attr({
      stroke: '#0f0',
      lineWidth: 2
    })
    expect(text.attr('stroke')).toBe('#0f0');
  });
});