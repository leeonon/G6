import { group } from '@antv/util';
import { Renderer } from '@antv/g-canvas';
import { Canvas, Group } from '../../src';

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);
// div.style.position = 'absolute';
// div.style.top = '165px';
// div.style.left = '8px';

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
  let text, circle;

  it('canvas.on off', () => {
    let count = 0;
    const func = e => {
      expect(e.item.isCanvas()).toBe(true);
      count++;
    };
    canvas.on('click', func);
    canvas.emit('click', { item: canvas });
    expect(count).toBe(1);

    canvas.off('click', func);
    canvas.emit('click', { item: canvas });
    expect(count).toBe(1);

    canvas.once('click', func);
    canvas.emit('click', { item: canvas });
    expect(count).toBe(2);
    canvas.emit('click', { item: canvas });
    expect(count).toBe(2);
  });

  it('group.on off', () => {
    // 加入四个顶点撑开
    circle = subGroup.addShape('circle', {
      attrs: {
        r: 10,
        x: 10,
        y: 10,
        fill: '#f00'
      },
      name: 'circle-shape'
    });

    let count = 0;
    const func = e => {
      expect(e.item.isCanvas()).toBe(false);
      count++;
    };
    subGroup.on('click', func);
    subGroup.emit('click', { item: subGroup });
    expect(count).toBe(1);

    subGroup.off('click', func);
    subGroup.emit('click', { item: subGroup });
    expect(count).toBe(1);

    subGroup.once('click', func);
    subGroup.emit('click', { item: subGroup });
    expect(count).toBe(2);
    subGroup.emit('click', { item: subGroup });
    expect(count).toBe(2);
  });

  it('shape:click', () => {
    let count = 0;
    const func = e => {
      expect(e.item.isCanvas()).toBe(false);
      count++;
    };
    circle.on('click', func);
    circle.emit('click', { item: circle });
    expect(count).toBe(1);

    circle.off('click', func);
    circle.emit('click', { item: circle });
    expect(count).toBe(1);

    circle.once('click', func);
    circle.emit('click', { item: circle });
    expect(count).toBe(2);
    circle.emit('click', { item: circle });
    expect(count).toBe(2);
  });

  // canvasXY: canvas 坐标系/世界坐标系 = e.x, e.y。可以与 viewportXY 转换
  // —— 与 G6 pointXY 概念一致

  // viewportXY: Viewport 坐标系，考虑相机变换。可与 canvasXY、clientXY 转换
  // —— 与 G6 canvasXY 概念一致

  // clientXY：浏览器坐标系，可以和 viewport 转换
  // —— 与 G6 clientXY 概念一致

  // screenXY：屏幕坐标系，不考虑页面滚动

  // pageXY：文档坐标系，考虑页面滚动

  it('canvas agency', () => { // 不能写 done，因为上方的 div 在 done 之后才会渲染，导致测试的坐标不准确
    // 设置相机位置之后，响应不到图形事件
    // canvas.getCamera().setPosition(-50, -50)

    canvas.on('click', e => {
      const { canvas: canvasXY, client, viewport } = e;
      const canvas2viewport = canvas.getCanvasByPoint(canvasXY.x, canvasXY.y);
      expect(approximate(canvas2viewport.x, viewport.x, 0.1)).toBe(true);
      expect(approximate(canvas2viewport.y, viewport.y, 0.1)).toBe(true);

      const client2viewport = canvas.canvasEle.client2Viewport(client);
      expect(approximate(client2viewport.x, viewport.x, 0.1)).toBe(true);
      expect(approximate(client2viewport.y, viewport.y, 0.1)).toBe(true);

      const viewport2canvas = canvas.getPointByCanvas(viewport.x, viewport.y);
      expect(approximate(viewport2canvas.x, canvasXY.x, 0.1)).toBe(true);
      expect(approximate(viewport2canvas.y, canvasXY.y, 0.1)).toBe(true);
      const viewport2client = canvas.canvasEle.viewport2Client(viewport);
      expect(approximate(viewport2client.x, client.x)).toBe(true);
      expect(approximate(viewport2client.y, client.y)).toBe(true);
    });
    setTimeout(() => {
      canvas.emit('click', {
        type: "click",
        pointerType: "mouse",
        target: circle,
        canvas: { x: 11.461600303649902, y: 14.957695960998535 },
        client: { x: 19.456378936767578, y: 179.736328125 },
        viewport: { x: 11.46158742904663, y: 14.957687377929688 },
        screen: { x: -1632.65234375, y: -230.31640625 },
        page: { x: 19.456378936767578, y: 179.736328125 }
      })
    }, 500);
  });
});