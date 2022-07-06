import { ShapeAttrs } from './shape';

/**
 * element attributes for animation
 */
export type ElementAttrs = ShapeAttrs & {
  matrix?: number[];
}

export type OnFrame = (ratio: number) => ElementAttrs | void;


export type AnimateCfg = {
  /**
   * 动画执行时间
   * @type {number}
   */
  duration?: number;
  /**
   * 动画缓动效果
   * @type {string}}
   */
  easing?: string;
  /**
   * 动画执行的延迟时间
   * @type {function}}
   */
  delay?: number;
  /**
   * 是否重复执行动画
   * @type {boolean}}
   */
  repeat?: boolean;
  /**
   * 动画执行完时的回调函数
   * @type {function}}
   */
  callback?: () => void;
  /**
   * 动画暂停时的回调函数
   * @type {function}}
   */
  pauseCallback?: () => void;
  /**
   * 动画恢复(重新唤醒)时的回调函数
   * @type {function}}
   */
  resumeCallback?: () => void;
};

export type Animation = AnimateCfg & {
  id: string;
  fromAttrs: {
    [key: string]: any;
  };
  toAttrs: {
    [key: string]: any;
  };
  startTime: number;
  pathFormatted: boolean;
  onFrame?: OnFrame;
  _paused?: boolean;
  _pauseTime?: number;
};