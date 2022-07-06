import { Renderer } from '../../node_modules/@antv/g-canvas';
import { ext } from '@antv/matrix-util';
import { Canvas, Group } from '../../src';
import { isArray, isNumber } from '@antv/util';

const { transform } = ext;

const div = document.createElement('div');
div.id = 'shapes-spec';
document.body.appendChild(div);

const approximate = (a, b, threshold = 1) => Math.abs(a - b) < threshold;

describe('shape animate', () => {
  const renderer = new Renderer();
  let canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  let rootGroup = canvas.addGroup({ id: 'root-group' });
  let subGroup = rootGroup.addGroup({ id: 'sub-group' });

  it('destroy when animate', () => {
    const rect1 = subGroup.addShape('rect', {
      attrs: {
        width: 40,
        height: 20,
        x: 15,
        y: 315,
        fill: '#f00',
        stroke: '#00f',
        lineWidth: 2
      },
    });
    const rect2 = subGroup.addShape('rect', {
      attrs: {
        width: 40,
        height: 20,
        x: 115,
        y: 315,
        fill: '#f00',
        stroke: '#00f',
        lineWidth: 2
      },
    });

    // 1. target attrs
    rect1.animate(
      { fill: '#0f0', stroke: '#f00', lineWidth: 10 },
      {
        duration: 500,
        easing: 'easeLinear',
        repeat: false,
        callback: () => {
          expect(rect1.attr('fill')).toBe('#0f0');
          expect(rect1.attr('stroke')).toBe('#f00');
          expect(rect1.attr('lineWidth')).toBe(10);
        }
      }
    );

    rect1.remove();

    // 2. onFrame
    rect2.animate(
      ratio => {
        return { width: 40 + ratio * 100 }
      },
      {
        duration: 800,
        easing: 'easeLinear',
        repeat: false,
        callback: () => {
          expect(approximate(rect2.attr('width'), 139, 2)).toBe(true);
        }
      }
    )

    canvas.destroy()



  });

  it('rect animate', (done) => {
    canvas = new Canvas({
      container: div,
      renderer,
      width: 500,
      height: 500
    });
    rootGroup = canvas.addGroup({ id: 'root-group' });
    subGroup = rootGroup.addGroup({ id: 'sub-group' });

    const rect1 = subGroup.addShape('rect', {
      attrs: {
        width: 40,
        height: 20,
        x: 15,
        y: 15,
        fill: '#f00',
        stroke: '#00f',
        lineWidth: 2
      },
    });
    const rect2 = subGroup.addShape('rect', {
      attrs: {
        width: 40,
        height: 20,
        x: 115,
        y: 15,
        fill: '#f00',
        stroke: '#00f',
        lineWidth: 2
      },
    });
    const rect3 = subGroup.addShape('rect', {
      attrs: {
        width: 40,
        height: 20,
        x: 15,
        y: 115,
        fill: '#f00',
        stroke: '#00f',
        lineWidth: 2
      },
    });

    // 1. target attrs
    rect1.animate(
      { fill: '#0f0', stroke: '#f00', lineWidth: 10 },
      {
        duration: 500,
        easing: 'easeLinear',
        repeat: false,
        callback: () => {
          expect(rect1.attr('fill')).toBe('#0f0');
          expect(rect1.attr('stroke')).toBe('#f00');
          expect(rect1.attr('lineWidth')).toBe(10);
        }
      }
    );

    // 2. onFrame
    rect2.animate(
      ratio => {
        return { width: 40 + ratio * 100 }
      },
      {
        duration: 800,
        easing: 'easeLinear',
        repeat: false,
        callback: () => {
          expect(approximate(rect2.attr('width'), 139, 2)).toBe(true);
          // done();
        }
      }
    )

    // 多个动画
    rect3.animate(
      (ratio) => ({ opacity: Math.max(0.1, 1 - ratio) }),
      { duration: 1000, easing: 'linear' }
    );
    rect3.animate(
      { height: 100 },
      { duration: 1000, easing: 'linear' }
    );
    setTimeout(() => {
      rect3.pauseAnimate();
      expect(rect3.attr('opacity')).not.toBe(0);
      expect(rect3.attr('opacity')).not.toBe(1);

      expect(rect3.attr('opacity')).not.toBe('20px');
      expect(rect3.attr('opacity')).not.toBe(20);
      expect(rect3.attr('opacity')).not.toBe('100px');
      expect(rect3.attr('opacity')).not.toBe(100);
      expect(rect3.isPaused).toBe(true);

      setTimeout(() => {
        rect3.resumeAnimate();
        expect(rect3.isPaused).toBe(false);
      }, (600));
    }, 800);

    setTimeout(() => {
      // 将运行到最后一帧
      rect3.stopAnimate();
      expect(rect3.attr('opacity')).toBe(0.1);
      expect(rect3.attr('height')).toBe(100);
      done();
    }, 1500);

  });

});

describe('group animate', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  it('group animate', () => {
    subGroup.addShape('path', {
      attrs: {
        path: [
          ['M', 10, 10],
          ['L', 500, 300]
        ],
        stroke: '#f00',
        lineWidth: 3
      }
    });

    let matrix = subGroup.getMatrix();
    const dx = 10 * matrix[0];
    const dy = 20 * matrix[4];
    let lastX = 0;
    let lastY = 0;
    let newX = 0;
    let newY = 0;
    subGroup.animate((ratio) => {
      newX = dx * ratio;
      newY = dy * ratio;
      matrix = transform(matrix, [['t', newX - lastX, newY - lastY]]);
      lastX = newX;
      lastY = newY;
      return { matrix };
    }, {
      duration: 1000,
      repeat: false,
      callback: () => {
        const afterMatrix = subGroup.getMatrix();
        expect(approximate(afterMatrix[6], 10)).toBe(true);
        expect(approximate(afterMatrix[7], 20)).toBe(true);
        canvas.destroy();
      }
    });
  });
});

describe('line arrow aniate', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });

  it('line arrow animate', () => {
    const line = subGroup.addShape('line', {
      attrs: {
        x1: 20,
        y1: 20,
        x2: 50,
        y2: 80,
        stroke: '#f00',
        lineWidth: 3,
        endArrow: {
          fill: '#f00',
          path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
        }
      }
    });
    line.animate({
      stroke: '#0f0',
      // TODO: 问题：箭头位置不跟随，待 G 修复箭头问题后再尝试
      x1: 30,
      y1: 40,
      // 注意，endArrow 的动画更新是不生效的
      // endArrow: {
      //   fill: '#00f',
      //   path: 'M 0,0 L 24,-12 L 20,0 L 24,12 Z'
      // }
    }, {
      duration: 500,
      callback: () => {
        expect(line.attr('x1')).toBe(30);
        expect(line.attr('stroke')).toBe('#0f0');
      }
    })
  });

  it('path with animate', () => {
    // string path
    const path = 'M 100,300' + 'l 50,-25' + 'a25,25 -30 0,1 50,-80'
    const pathArrow = subGroup.addShape('path', {
      attrs: {
        path,
        stroke: '#509FEE',
        lineWidth: 5,
        lineDash: [8, 8],
        lineCap: 'round',
        endArrow: {
          fill: '#f00',
          path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
        },
      },
    });
    pathArrow.animate({
      // TODO: 同样的箭头没有跟随
      path: 'M 150,320' + 'l 50,-25' + 'a100,100 -80 0,1 50,-80',
      lineWidth: 2,
      lineDash: [3, 3],
    }, {
      duration: 500,
      callback: () => {
        expect(pathArrow.attr('path')).toBe('M 150,320' + 'l 50,-25' + 'a100,100 -80 0,1 50,-80');
        expect(pathArrow.attr('lineDash')[0]).toBe(3);
      }
    })
  });

  it('polyline with animate', () => {
    const points = [
      [100, 0],
      [150, 0],
      [150, 50],
      [200, 50],
      [200, 100],
      [250, 100],
    ];
    const lineDash = [4, 2, 1, 2];
    const polyline = subGroup.addShape('polyline', {
      attrs: {
        points,
        stroke: '#509FEE',
        lineWidth: 1,
        lineCap: 'round',
        endArrow: {
          fill: '#f00',
          path: 'M 0,0 L 12,-6 L 10,0 L 12,6 Z'
        },
      },
      name: 'pathArrow-shape-name',
      id: 'pathArrow-shape-id'
    });
    let index = 0;
    polyline.animate(ratio => {
      index++;
      if (index > 9) {
        index = 0;
      }
      return {
        lineDash,
        lineDashOffset: -index,
      };
    }, {
      duration: 500,
      callback: () => {
        expect(isArray(polyline.attr('lineDash'))).toBe(true);
        expect(isNumber(polyline.attr('lineDashOffset'))).toBe(true);
      }
    })
  });


});

describe.only('canvas animate', () => {
  const renderer = new Renderer();
  const canvas = new Canvas({
    container: div,
    renderer,
    width: 500,
    height: 500
  });
  const rootGroup = canvas.addGroup({ id: 'root-group' });
  const subGroup = rootGroup.addGroup({ id: 'sub-group' });
  it('group animate', () => {
    const circles = []
    for (let i = 1; i < 20; i++) {
      circles.push(subGroup.addShape('circle', {
        attrs: {
          fill: '#f00',
          r: 10,
          x: i / 3 * 50 + 50,
          y: i % 3 * 20 + 50
        }
      }));
    }

    let stopped = false;
    canvas.animate(ratio => {
      circles.forEach(circle => {
        const { x, y } = circle.attr();
        circle.attr({ x: x + ratio * Math.random() * 10, y: y + ratio * Math.random() * 10 });
      })
    }, {
      duration: 1000,
      easing: 'Linear',
      callback: () => {
        expect(stopped).toBe(true);
        expect(circles[0].attr('x') > 50).toBe(true);
        expect(circles[0].attr('y') > 50).toBe(true);
      },
    });
    setTimeout(() => {
      canvas.pauseAnimate();
      expect(canvas.isPaused).toBe(true);
      canvas.resumeAnimate();
      expect(canvas.isPaused).toBe(false);
      stopped = true;
      canvas.stopAnimate();
    }, 500)
  });
});