import { useRef, useCallback } from 'react';
import { useDocumentManagerCapability } from '@embedpdf/plugin-document-manager/react';
import { computeFileHash } from '../utils/file-hash';
import { setLastFile } from '../plugins/split';

/**
 * Provides an openFile() function that:
 * 1. Shows a native file picker
 * 2. Reads the file as ArrayBuffer
 * 3. Computes SHA-256 hash → uses as documentId (stable across sessions)
 * 4. Calls openDocumentBuffer so the same PDF always gets the same documentId
 *
 * The hidden <input> element must be rendered in the component tree.
 * Use the `inputRef` from this hook.
 */
export function useOpenFile() {
  const { provides: docManager } = useDocumentManagerCapability();
  const inputRef = useRef<HTMLInputElement>(null);

  const openFile = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !docManager) return;

      setLastFile(file); // save for pdf-lib operations (split/merge)
      const buffer = await file.arrayBuffer();
      const hash = await computeFileHash(buffer);

      if (docManager.isDocumentOpen(hash)) {
        docManager.setActiveDocument(hash);
        e.target.value = '';
        return;
      }

      docManager
        .openDocumentBuffer({
          buffer,
          name: file.name,
          documentId: hash,
          autoActivate: true,
        })
        .wait(
          () => {},
          (err) => console.error('Failed to open PDF', err)
        );

      // Reset input so the same file can be reopened
      e.target.value = '';
    },
    [docManager]
  );

  return { openFile, inputRef, handleFileChange };
}
