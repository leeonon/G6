import { each, isEqual, noop, isFunction, isObject, isNumber } from '@antv/util';

// 可以在 toAttrs 中设置，但不属于绘图属性的字段
const RESERVED_PORPS = ['repeat'];

const getFormatToAttrs = (props, shape) => {
  const toAttrs = {};
  const attrs = shape.attr();
  each(props, (v, k) => {
    if (RESERVED_PORPS.indexOf(k) === -1 && !isEqual(attrs[k], v)) {
      toAttrs[k] = v;
    }
  });
  return toAttrs;
}

const getFormatFromAttrs = (toAttrs, shape) => {
  const fromAttrs = {};
  const attrs = shape.attr();
  for (const k in toAttrs) {
    if (attrs[k] !== undefined) {
      fromAttrs[k] = attrs[k];
    }
  }
  return fromAttrs;
}

/**
 * 执行动画，支持多种函数签名
 * 1. animate(toAttrs: ElementAttrs, duration: number, easing?: string, callback?: () => void, delay?: number)
 * 2. animate(onFrame: OnFrame, duration: number, easing?: string, callback?: () => void, delay?: number)
 * 3. animate(toAttrs: ElementAttrs, cfg: AnimateCfg)
 * 4. animate(onFrame: OnFrame, cfg: AnimateCfg)
 * 各个参数的含义为:
 *   toAttrs  动画最终状态
 *   onFrame  自定义帧动画函数
 *   duration 动画执行时间
 *   easing   动画缓动效果
 *   callback 动画执行后的回调
 *   delay    动画延迟时间
 */
const processAnimate = (args, shape, callAnimate) => {
  // this.set('animating', true);
  const animations = shape.get('animations') || [];
  let [toAttrs, duration, easing = 'easeLinear', callback = noop, delay = 0] = args;
  let onFrame; // : OnFrame;
  let repeat: boolean;
  let pauseCallback;
  let resumeCallback;
  let animateCfg; // : AnimateCfg;
  let fill: string;

  // 第一个参数，既可以是动画最终状态 toAttrs，也可以是自定义帧动画函数 onFrame
  if (isFunction(toAttrs)) {
    onFrame = toAttrs; // as OnFrame;
    toAttrs = {};
  } else if (isObject(toAttrs) && (toAttrs as any).onFrame) {
    // 兼容 3.0 中的写法，onFrame 和 repeat 可在 toAttrs 中设置
    onFrame = (toAttrs as any).onFrame; // as OnFrame;
    repeat = (toAttrs as any).repeat;
  }

  // 第二个参数，既可以是执行时间 duration，也可以是动画参数 animateCfg
  if (isObject(duration)) {
    animateCfg = duration; // as AnimateCfg;
    duration = animateCfg.duration;
    easing = animateCfg.easing || 'easeLinear';
    delay = animateCfg.delay || 0;
    fill = animateCfg.fill;
    // animateCfg 中的设置优先级更高
    repeat = animateCfg.repeat || repeat || false;
    callback = animateCfg.callback || noop;
    pauseCallback = animateCfg.pauseCallback || noop;
    resumeCallback = animateCfg.resumeCallback || noop;
  } else {

    // 第四个参数，既可以是回调函数 callback，也可以是延迟时间 delay
    if (isNumber(callback)) {
      delay = callback;
      callback = null;
    }

    // 第三个参数，既可以是缓动参数 easing，也可以是回调函数 callback
    if (isFunction(easing)) {
      callback = easing;
      easing = 'easeLinear';
    } else {
      easing = easing || 'easeLinear';
    }
  }
  const formatToAttrs = getFormatToAttrs(toAttrs, shape);

  const animation = callAnimate(
    [getFormatFromAttrs(formatToAttrs, shape), formatToAttrs],
    {
      duration: duration === undefined ? 500 : duration,
      easing,
      iterations: repeat ? Infinity : 1,
      delay,
      fill: fill || 'both'
    }
  );
  if (!animation) return;

  animation.onframe = (e) => {
    const { target, propRatio } = e;
    const computedTiming = (target as Animation).effect.getComputedTiming();
    const progress = propRatio === undefined ? computedTiming.progress : propRatio;
    if (onFrame) {
      const frameAttrs = onFrame(progress);
      const { matrix, ...attrs } = frameAttrs || {};
      if (matrix) {
        shape.setMatrix(matrix);
      }
      attrs && shape.attr(attrs);
    }
  };

  animation.onfinish = () => {
    callback?.();
  };

  // @ts-ignore
  animation._onAdapterPause = pauseCallback;
  // @ts-ignore
  animation._onResumePause = resumeCallback;

  animations.push(animation);
  shape.set('animations', animations);
}

export { getFormatToAttrs, getFormatFromAttrs, processAnimate };