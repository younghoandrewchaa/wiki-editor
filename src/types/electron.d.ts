interface ElectronAPI {
  onFileOpened: (callback: (filePath: string) => void) => () => void;
  readFile: (filePath: string) => Promise<{ path: string; content: string }>;
}

interface Window {
  electronAPI: ElectronAPI;
}
