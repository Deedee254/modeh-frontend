// Deprecated shim — replaced by dynamic import of the real math extension.
// Keep this file as a no-op to avoid accidental imports during SSR.
const DeprecatedMathShim = {
  name: 'math-katex-deprecated-shim',
  configure() { return this }
}

export default DeprecatedMathShim
