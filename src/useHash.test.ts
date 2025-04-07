// src/useHash.test.ts
import { act, renderHook } from '@testing-library/react-hooks';
import { useHash } from './useHash';

jest.mock('./useLifecycles', () => ({
  __esModule: true,
  default: (onMount: () => void, onUnmount: () => void) => {
    onMount();
    // simulate unmount manually during test if needed
    (useHash as any)._onUnmount = onUnmount;
  },
}));

jest.mock('./misc/util', () => ({
  on: jest.fn((target, event, handler) => {
    target.addEventListener(event, handler);
  }),
  off: jest.fn((target, event, handler) => {
    target.removeEventListener(event, handler);
  }),
}));

describe('useHash Hook', () => {
  let originalHash: string;

  beforeEach(() => {
    originalHash = window.location.hash;
    window.location.hash = '';
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    window.location.hash = originalHash;
    jest.restoreAllMocks();
  });

  it('should initialize with the current hash from window.location', () => {
    window.location.hash = '#initial';

    const { result } = renderHook(() => useHash());
    const [hash] = result.current;

    expect(hash).toBe('#initial');
  });

  it('should set a new hash when _setHash is called', () => {
    window.location.hash = '#start';
    const { result } = renderHook(() => useHash());

    act(() => {
      const [, setHash] = result.current;
      setHash('#newValue');
    });

    const [hash] = result.current;
    expect(hash).toBe('#newValue');
    expect(window.location.hash).toBe('#newValue');
  });

  it('should register and unregister event listeners on mount and unmount', () => {
    const { unmount } = renderHook(() => useHash());

    expect(window.addEventListener).toHaveBeenCalledWith('hashchange', expect.any(Function));

    act(() => {
      (useHash as any)._onUnmount?.(); // simulate manual unmount
    });

    expect(window.removeEventListener).toHaveBeenCalledWith('hashchange', expect.any(Function));
    unmount();
  });

  it('should update hash when window.location.hash changes outside the hook', () => {
    const { result } = renderHook(() => useHash());

    act(() => {
      window.location.hash = '#externalChange';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    const [hash] = result.current;
    expect(hash).toBe('#externalChange');
  });

  it('does not update the hash if setHash is called with the current hash', () => {
    window.location.hash = '#value';
    const { result } = renderHook(() => useHash());

    act(() => {
      const [, setHash] = result.current;
      setHash('#value');
    });

    const [hash] = result.current;
    expect(hash).toBe('#value');
    expect(window.location.hash).toBe('#value');
  });
});
