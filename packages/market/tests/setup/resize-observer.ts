// jsdom ships no ResizeObserver, and primitives' Tooltip sizes and reveals
// its bubble inside a ResizeObserver effect: without an observer the bubble
// mounts but stays `visibility: hidden`, outside the accessibility tree a
// getByRole('tooltip') can see. A real observer always delivers once on
// observe — deliver that one entry synchronously so `fit()` marks the
// bubble visible, and leave later resize notifications to per-test stubs.
// Plain assignment, not vi.stubGlobal: the client specs run
// vi.unstubAllGlobals() in afterEach, which would restore the name to
// `undefined` after the first test. A test that needs its own observer
// still overrides this through stubGlobal and restores cleanly.
globalThis.ResizeObserver = class {
  constructor(private readonly callback: ResizeObserverCallback) {}
  observe(target: Element) {
    this.callback(
      [{
        target,
        borderBoxSize: [{ inlineSize: 120, blockSize: 40 }],
        contentRect: { width: 120, height: 40 },
      } as unknown as ResizeObserverEntry],
      this as unknown as ResizeObserver,
    )
  }
  unobserve() {}
  disconnect() {}
}
