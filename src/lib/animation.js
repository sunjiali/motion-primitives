// mini-remotion 动画库（浏览器端）
// 设计原则：全部是帧的纯函数 —— 同一帧永远渲染出同一画面。
// 这是并发截图正确性的根基（Remotion 的 spring 也是确定性的）。
window.Remotion = window.Remotion || {};

(function () {
  // ---------- interpolate ----------
  // interpolate(frame, [0, 90], [0, 600]) —— 分段线性映射
  // options: { extrapolateLeft: 'extend'|'clamp'|'identity', extrapolateRight: 同左 }
  function interpolate(input, inputRange, outputRange, options) {
    options = options || {};
    const exL = options.extrapolateLeft || 'extend';
    const exR = options.extrapolateRight || 'extend';
    if (inputRange.length !== outputRange.length) {
      throw new Error('interpolate: inputRange 与 outputRange 长度必须一致');
    }
    function extrapolate(x, l, r, mode) {
      if (mode === 'clamp') return Math.min(Math.max(x, l), r);
      if (mode === 'identity') return x;
      return x; // extend：线性外推
    }
    let i = 0;
    if (input < inputRange[0]) {
      const slope = (outputRange[1] - outputRange[0]) / (inputRange[1] - inputRange[0]);
      return outputRange[0] + slope * (extrapolate(input, inputRange[0], inputRange[1], exL) - inputRange[0]);
    }
    for (i = 0; i < inputRange.length - 1; i++) {
      if (input <= inputRange[i + 1]) break;
    }
    if (i >= inputRange.length - 1) {
      const n = inputRange.length - 1;
      const slope = (outputRange[n] - outputRange[n - 1]) / (inputRange[n] - inputRange[n - 1]);
      return outputRange[n] + slope * (extrapolate(input, inputRange[n - 1], inputRange[n], exR) - inputRange[n]);
    }
    const t = (input - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
    return outputRange[i] + t * (outputRange[i + 1] - outputRange[i]);
  }

  // ---------- easing ----------
  const Easing = {
    linear: (t) => t,
    quadIn: (t) => t * t,
    quadOut: (t) => 1 - (1 - t) * (1 - t),
    quadInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    cubicIn: (t) => t * t * t,
    cubicOut: (t) => 1 - Math.pow(1 - t, 3),
    cubicInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    backOut: (t) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  };

  // ---------- spring ----------
  // 阻尼弹簧解析解（欠阻尼），t 以秒计。与 Remotion 同构：给定帧，结果唯一。
  // spring({ frame, fps, from: 0, to: 600, stiffness: 120, damping: 14 })
  function spring(opts) {
    const { frame, fps, from = 0, to = 1 } = opts;
    const stiffness = opts.stiffness == null ? 100 : opts.stiffness;
    const damping = opts.damping == null ? 10 : opts.damping;
    const mass = opts.mass == null ? 1 : opts.mass;
    const t = frame / fps;
    const w0 = Math.sqrt(stiffness / mass);
    const zeta = damping / (2 * Math.sqrt(stiffness * mass));
    let x;
    if (zeta < 1) {
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      x = 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
    } else {
      // 过阻尼：退化为指数趋近
      x = 1 - Math.exp(-w0 * t);
    }
    return from + (to - from) * x;
  }

  window.Remotion.interpolate = interpolate;
  window.Remotion.Easing = Easing;
  window.Remotion.spring = spring;
})();
