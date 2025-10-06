// Local shim for tiptap-extension-math-katex
// Provides a minimal object with `configure` to avoid build-time resolution errors
const MathKatexStub = {
  name: 'math-katex-stub',
  configure(options) {
    // return a basic passthrough extension-like object
    return this
  }
}

export default MathKatexStub
