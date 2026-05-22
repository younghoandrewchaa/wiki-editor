// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onFileOpened: (callback: (filePath: string) => void) => {
    ipcRenderer.on('file-opened', (_event, filePath: string) => callback(filePath));
  },
  readFile: (filePath: string): Promise<{ path: string; content: string }> => {
    return ipcRenderer.invoke('read-file', filePath);
  },
});
