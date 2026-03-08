import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Listen for a file to be opened from the OS (argv or open-file event).
   * Callback receives { buffer: ArrayBuffer, name: string }
   */
  onOpenFile: (callback) => {
    ipcRenderer.on('open-file', (_event, data) => callback(data));
  },
});
