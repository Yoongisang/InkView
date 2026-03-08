import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Pull model: renderer calls this when docManager is ready.
   * Returns { buffer: ArrayBuffer, name: string } or null.
   */
  getOpenFile: () => ipcRenderer.invoke('get-open-file'),

  /**
   * Push model: for files opened while the app is already running
   * (macOS open-file, Windows second-instance).
   */
  onOpenFile: (callback) => {
    ipcRenderer.on('open-file', (_event, data) => callback(data));
  },
});
