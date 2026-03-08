import { useState, useEffect } from 'react';

/**
 * Re-reads the last opened file to obtain its raw bytes for pdf-lib.
 * We store the file in a module-level ref so it survives between renders.
 */
let _lastFile: File | null = null;

export function setLastFile(file: File) {
  _lastFile = file;
}

export function useLastFile() {
  return _lastFile;
}

/**
 * Reads the last opened PDF file as Uint8Array, caching the result.
 */
export function usePdfBytes(documentId: string | null) {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [baseName, setBaseName] = useState('document');

  useEffect(() => {
    if (!documentId || !_lastFile) return;
    const file = _lastFile;
    file.arrayBuffer().then((buf) => {
      setBaseName(file.name.replace(/\.pdf$/i, ''));
      setPdfBytes(new Uint8Array(buf));
    });
  }, [documentId]);

  return { pdfBytes: documentId && _lastFile ? pdfBytes : null, baseName };
}
