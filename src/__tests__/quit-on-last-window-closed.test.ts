import { describe, it, expect, vi, beforeAll } from 'vitest';

const mockQuit = vi.fn();
const appHandlers: Record<string, (...args: unknown[]) => void> = {};

vi.mock('electron', () => ({
  app: {
    quit: () => mockQuit(),
    on: (event: string, cb: (...args: unknown[]) => void) => {
      appHandlers[event] = cb;
    },
  },
  BrowserWindow: class MockBW {
    webContents = { once() {}, on() {}, send() {} };
    loadURL() {}
    loadFile() {}
    static getAllWindows() { return []; }
  },
  ipcMain: { handle: vi.fn() },
  screen: { getPrimaryDisplay: () => ({ workAreaSize: { width: 1440, height: 900 } }) },
  session: { defaultSession: { webRequest: { onHeadersReceived: vi.fn() } } },
  shell: { openExternal: vi.fn() },
}));

vi.mock('electron-squirrel-startup', () => ({ default: false }));
vi.mock('../update-checker', () => ({ checkForUpdate: vi.fn() }));
vi.mock('../window-close-handler', () => ({ attachCloseHandler: vi.fn() }));
vi.mock('node:fs', () => ({
  default: { promises: { readFile: vi.fn(), writeFile: vi.fn() } },
}));
vi.mock('node:path', () => ({
  default: { join: (...parts: string[]) => parts.join('/') },
}));

beforeAll(async () => {
  (globalThis as Record<string, unknown>).MAIN_WINDOW_VITE_DEV_SERVER_URL = undefined;
  (globalThis as Record<string, unknown>).MAIN_WINDOW_VITE_NAME = 'main_window';
  await import('../main');
});

describe('app quit on last window close', () => {
  it('quits the app when all windows are closed', () => {
    mockQuit.mockClear();
    appHandlers['window-all-closed']?.();
    expect(mockQuit).toHaveBeenCalled();
  });

  it('quits even on macOS (no darwin platform exception)', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(process, 'platform');
    Object.defineProperty(process, 'platform', { value: 'darwin', configurable: true });

    mockQuit.mockClear();
    appHandlers['window-all-closed']?.();

    expect(mockQuit).toHaveBeenCalled();

    if (originalDescriptor) {
      Object.defineProperty(process, 'platform', originalDescriptor);
    }
  });
});
