import { app, BrowserWindow, ipcMain, session } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

let pendingFilePath: string | null = null;

// Must be registered before 'ready' to catch files opened at launch on macOS.
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  const win = BrowserWindow.getAllWindows()[0];
  if (win) {
    win.webContents.send('file-opened', filePath);
  } else {
    pendingFilePath = filePath;
  }
});

ipcMain.handle('read-file', async (_, filePath: string) => {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return { path: filePath, content };
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.webContents.once('did-finish-load', () => {
    if (pendingFilePath) {
      mainWindow.webContents.send('file-opened', pendingFilePath);
      pendingFilePath = null;
    }
  });

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

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
