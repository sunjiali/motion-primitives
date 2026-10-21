// Shared ambient types for the browser-side lib scripts.
//
// The lib files are plain scripts, not modules: the renderer
// concatenates them into one <script> (animation → captions →
// primitives) and the site loads them the same way. These declarations
// are how the scripts share types without a module graph. The runtime
// holder is created by animation (the first script in the concat).

type EasingName =
  | 'linear' | 'quadIn' | 'quadOut' | 'quadInOut'
  | 'cubicIn' | 'cubicOut' | 'cubicInOut' | 'backOut';

type EasingFn = (t: number) => number;

interface InterpolateOptions {
  extrapolateLeft?: 'extend' | 'clamp' | 'identity';
  extrapolateRight?: 'extend' | 'clamp' | 'identity';
}

interface SpringOptions {
  frame: number;
  fps: number;
  from?: number;
  to?: number;
  stiffness?: number;
  damping?: number;
  mass?: number;
}

interface CaptionCue {
  startFrame: number;
  endFrame: number;
  text: string;
}

interface CaptionStyle {
  bottom?: string;
  bgOpacity?: number;
  color?: string;
  font?: string;
}

interface RemotionStatic {
  interpolate: (
    input: number,
    inputRange: number[],
    outputRange: number[],
    options?: InterpolateOptions,
  ) => number;
  Easing: Record<EasingName, EasingFn>;
  spring: (opts: SpringOptions) => number;
  parseSRT: (srt: string, fps: number) => CaptionCue[];
  renderCaption: (
    frame: number,
    stage: HTMLElement,
    captions: CaptionCue[],
    style?: CaptionStyle,
  ) => void;
}

// The global namespace holder the lib scripts attach to. Members are
// Partial at the seam because the scripts attach them one by one, in
// concat order; consumers inside a script cast once at the boundary.
interface RootHolder {
  Remotion: Partial<RemotionStatic>;
  Motion: unknown;
  M: unknown;
}

interface Window {
  Remotion: Partial<RemotionStatic>;
  Motion: unknown;
  M: unknown;
}
