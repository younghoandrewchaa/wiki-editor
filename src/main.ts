import { app, BrowserWindow, ipcMain, screen, session, shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { checkForUpdate } from './update-checker';
import { attachCloseHandler } from './window-close-handler';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const pendingFilePaths: string[] = [];
let appReady = false;

// Must be registered before 'ready' to catch files opened at launch on macOS.
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (appReady) {
    createWindow(filePath);
  } else {
    pendingFilePaths.push(filePath);
  }
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return { path: filePath, content };
});

ipcMain.handle('save-file', async (_, filePath: string, content: string) => {
  await fs.promises.writeFile(filePath, content, 'utf-8');
});

ipcMain.handle('check-for-update', () => checkForUpdate());

ipcMain.handle('open-external', (_, url: string) => shell.openExternal(url));

const createWindow = (filePath?: string) => {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  const mainWindow = new BrowserWindow({
    width: Math.round(screenWidth / 2),
    height: screenHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  attachCloseHandler(mainWindow);

  if (filePath) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('file-opened', filePath);
    });
  }

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const load = () => mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Retry on ERR_CONNECTION_REFUSED (-102): happens when Vite is still
    // re-optimizing deps on first run after installing packages.
    mainWindow.webContents.on('did-fail-load', (_, errorCode) => {
      if (errorCode === -102) setTimeout(load, 1000);
    });
    load();
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  appReady = true;

  // Pick up file paths passed as CLI arguments (dev workflow only).
  // The open-file event is not emitted for argv — only for Apple Events from
  // a packaged, OS-registered app.
  const argFilePaths = process.argv.filter((arg) => /\.(md|markdown)$/i.test(arg));
  for (const p of argFilePaths) {
    if (!pendingFilePaths.includes(p)) pendingFilePaths.push(p);
  }

  // Set CSP for the renderer. In dev, Vite HMR requires unsafe-eval and
  // a WebSocket connection back to the dev server.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "connect-src 'self' http://localhost:* ws://localhost:*; " +
            "img-src 'self' data: blob:",
          ],
        },
      });
    });
  }

  if (pendingFilePaths.length > 0) {
    for (const p of pendingFilePaths.splice(0)) {
      createWindow(p);
    }
  } else {
    createWindow();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
