interface ElectronAPI {
  onFileOpened: (callback: (filePath: string) => void) => () => void;
  readFile: (filePath: string) => Promise<{ path: string; content: string }>;
  checkForUpdate: () => Promise<{ version: string; downloadUrl: string } | null>;
  openExternal: (url: string) => Promise<void>;
}

interface Window {
  electronAPI: ElectronAPI;
}
