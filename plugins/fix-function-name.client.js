export default defineNuxtPlugin(() => {
  try {
    const desc = Object.getOwnPropertyDescriptor(Function.prototype, 'name');
    if (desc && typeof desc.get === 'function') {
      const originalGetter = desc.get;
      Object.defineProperty(Function.prototype, 'name', {
        configurable: true,
        enumerable: false,
        get() {
          try {
            const val = originalGetter.call(this);
            if (typeof val === 'string') return val;
          } catch (e) {
            // fallthrough to safe extraction
          }
          try {
            const s = Function.prototype.toString.call(this);
            const m = s && s.match && s.match(/^\s*function\s*([^\s(]+)/);
            return (m && m[1]) || '';
          } catch (e) {
            return '';
          }
        }
      });
    }
  } catch (e) {
    // avoid breaking the app if anything goes wrong
    console.warn('fix-function-name plugin error', e);
  }
});
