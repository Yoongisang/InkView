import { useEffect } from 'react';
import { useDocumentManagerCapability } from '@embedpdf/plugin-document-manager/react';
import { computeFileHash } from '../utils/file-hash';

interface ElectronFileData {
  buffer: ArrayBuffer;
  name: string;
}

interface ElectronAPI {
  getOpenFile: () => Promise<ElectronFileData | null>;
  onOpenFile: (cb: (data: ElectronFileData) => void) => void;
}

function getElectronAPI(): ElectronAPI | null {
  return (window as { electronAPI?: ElectronAPI }).electronAPI ?? null;
}

/**
 * When InkView is used as the default PDF viewer on Windows/macOS,
 * Electron passes the file via IPC.
 *
 * - Pull model (getOpenFile): for files passed at launch via argv.
 *   Called once when docManager becomes available.
 * - Push model (onOpenFile): for files opened while the app is running
 *   (macOS Finder, Windows second-instance).
 */
export function useElectronFile() {
  const { provides: docManager } = useDocumentManagerCapability();

  useEffect(() => {
    const api = getElectronAPI();
    if (!api || !docManager) return;

    const openPdf = async (data: ElectronFileData) => {
      try {
        const hash = await computeFileHash(data.buffer);

        if (docManager.isDocumentOpen(hash)) {
          docManager.setActiveDocument(hash);
          return;
        }

        docManager
          .openDocumentBuffer({
            buffer: data.buffer,
            name: data.name,
            documentId: hash,
            autoActivate: true,
          })
          .wait(
            () => {},
            (err) => console.error('[InkView] Failed to open PDF:', err)
          );
      } catch (err) {
        console.error('[InkView] useElectronFile error:', err);
      }
    };

    // Pull: check if a file was passed at launch (argv)
    api.getOpenFile().then((data) => {
      if (data) openPdf(data);
    });

    // Push: listen for files opened while the app is running
    api.onOpenFile((data) => openPdf(data));
  }, [docManager]);
}
