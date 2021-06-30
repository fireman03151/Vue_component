export default function throttleByAnimationFrame(fn: (...args: any[]) => void) {
  let requestId: number | null;

  const later = (args: any[]) => () => {
    requestId = null;
    fn(...args);
  };

  const throttled = (...args: any[]) => {
    if (requestId == null) {
      requestId = requestAnimationFrame(later(args));
    }
  };

  (throttled as any).cancel = () => cancelAnimationFrame(requestId!);

  return throttled;
}

export function throttleByAnimationFrameDecorator() {
  // eslint-disable-next-line func-names
  return function (target: any, key: string, descriptor: any) {
    const fn = descriptor.value;
    let definingProperty = false;
    return {
      configurable: true,
      get() {
        // eslint-disable-next-line no-prototype-builtins
        if (definingProperty || this === target.prototype || this.hasOwnProperty(key)) {
          return fn;
        }

        const boundFn = throttleByAnimationFrame(fn.bind(this));
        definingProperty = true;
        Object.defineProperty(this, key, {
          value: boundFn,
          configurable: true,
          writable: true,
        });
        definingProperty = false;
        return boundFn;
      },
    };
  };
}
