import { useEffect } from 'react';
import { useDocumentManagerCapability } from '@embedpdf/plugin-document-manager/react';
import { computeFileHash } from '../utils/file-hash';

/**
 * When InkView is used as the default PDF viewer on Windows/macOS,
 * Electron reads the file from argv and sends it via IPC.
 * This hook listens for that event and opens the PDF automatically.
 */
export function useElectronFile() {
  const { provides: docManager } = useDocumentManagerCapability();

  useEffect(() => {
    // Only available inside Electron (preload exposes window.electronAPI)
    const api = (window as { electronAPI?: { onOpenFile: (cb: (data: { buffer: ArrayBuffer; name: string }) => void) => void } }).electronAPI;
    if (!api || !docManager) return;

    api.onOpenFile(async ({ buffer, name }) => {
      try {
        const hash = await computeFileHash(buffer);
        docManager
          .openDocumentBuffer({ buffer, name, documentId: hash, autoActivate: true })
          .wait(() => {}, (err) => console.error('[InkView] Failed to open PDF from Electron:', err));
      } catch (err) {
        console.error('[InkView] useElectronFile error:', err);
      }
    });
  }, [docManager]);
}
