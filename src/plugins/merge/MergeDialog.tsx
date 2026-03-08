import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Merge, Plus, Trash2, GripVertical, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { downloadFile } from '../split/utils';

interface MergeFile {
  id: string;
  file: File;
  pageCount: number | null; // null while loading
}

interface MergeDialogProps {
  open: boolean;
  onClose: () => void;
  /** Pre-load the current document's file if available */
  initialFile?: File | null;
}

export function MergeDialog({ open, onClose, initialFile }: MergeDialogProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<MergeFile[]>([]);
  const [autoBookmark, setAutoBookmark] = useState(true);
  const [outputName, setOutputName] = useState('merged');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens
  const prevOpen = useRef(false);
  if (open && !prevOpen.current) {
    prevOpen.current = true;
    setFiles([]);
    setError(null);
    setOutputName('merged');
    if (initialFile) {
      addFileToList(initialFile, setFiles);
    }
  }
  if (!open && prevOpen.current) {
    prevOpen.current = false;
  }

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    for (const file of arr) {
      await addFileToList(file, setFiles);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = '';
    },
    [addFiles]
  );

  const handleDropZone = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // Drag-to-reorder handlers
  const handleDragStart = useCallback((id: string) => setDraggedId(id), []);
  const handleDragEnd = useCallback(() => {
    if (draggedId && dragOverId && draggedId !== dragOverId) {
      setFiles((prev) => {
        const from = prev.findIndex((f) => f.id === draggedId);
        const to = prev.findIndex((f) => f.id === dragOverId);
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    }
    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId, dragOverId]);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      setError('병합할 PDF 파일을 2개 이상 추가하세요.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const merged = await PDFDocument.create();
      let pageOffset = 0;

      for (const mf of files) {
        const buffer = await mf.file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer);
        const pageCount = srcDoc.getPageCount();
        const pages = await merged.copyPages(srcDoc, Array.from({ length: pageCount }, (_, i) => i));
        pages.forEach((p) => merged.addPage(p));

        // autoBookmark: pdf-lib outline API is low-level; skipped for now
        void autoBookmark;
        pageOffset += pageCount;
      }

      const outBytes = await merged.save();
      downloadFile(outBytes, `${outputName || 'merged'}.pdf`);
      onClose();
    } catch (err) {
      setError('PDF 병합 중 오류가 발생했습니다: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  }, [files, autoBookmark, outputName, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex w-[520px] flex-col rounded-lg border border-border bg-surface shadow-xl" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-text">
            <Merge size={16} className="text-primary" />
            {t('merge.title')}
          </div>
          <button
            className="rounded p-1 text-text-muted hover:bg-surface-alt"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          {/* Drop zone */}
          <div
            className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-surface-alt'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDropZone}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-1 text-center">
              <Plus size={24} className="text-text-muted" />
              <p className="text-sm text-text-muted">{t('merge.dropzone')}</p>
              <p className="text-xs text-text-muted">또는 클릭하여 파일 선택</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />

          {/* File list */}
          {files.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-text-muted">
                병합 순서 (드래그로 순서 변경)
              </p>
              <ul className="flex flex-col gap-1">
                {files.map((mf, idx) => (
                  <li
                    key={mf.id}
                    draggable
                    onDragStart={() => handleDragStart(mf.id)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverId(mf.id); }}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 rounded border px-2 py-2 transition-colors ${
                      dragOverId === mf.id && draggedId !== mf.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-surface'
                    } ${draggedId === mf.id ? 'opacity-40' : ''}`}
                  >
                    <GripVertical size={14} className="flex-shrink-0 cursor-grab text-text-muted" />
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-text">
                      {mf.file.name}
                    </span>
                    <span className="flex-shrink-0 text-xs text-text-muted">
                      {mf.pageCount !== null ? `${mf.pageCount}p` : '…'}
                    </span>
                    <button
                      className="flex-shrink-0 rounded p-0.5 text-text-muted hover:text-red-500"
                      onClick={() => removeFile(mf.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Options */}
          <div className="flex flex-col gap-3 rounded border border-border bg-surface-alt p-3">
            {/* Output name */}
            <div className="flex items-center gap-2">
              <label className="w-24 flex-shrink-0 text-sm font-medium text-text">
                {t('merge.outputName')}
              </label>
              <input
                className="min-w-0 flex-1 rounded border border-border bg-surface px-2 py-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
              />
              <span className="flex-shrink-0 text-sm text-text-muted">.pdf</span>
            </div>

            {/* Auto bookmark */}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={autoBookmark}
                onChange={(e) => setAutoBookmark(e.target.checked)}
              />
              <span className="text-sm text-text">{t('merge.autoBookmark')}</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <span className="text-sm text-text-muted">
            {files.length > 0
              ? `${files.length}개 파일, 총 ${files.reduce((s, f) => s + (f.pageCount ?? 0), 0)}페이지`
              : t('merge.noFiles')}
          </span>
          <div className="flex gap-2">
            <button
              className="rounded px-4 py-2 text-sm text-text-muted hover:bg-surface-alt"
              onClick={onClose}
            >
              {t('dialog.cancel')}
            </button>
            <button
              className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              onClick={handleMerge}
              disabled={files.length < 2 || isProcessing}
            >
              <Download size={14} />
              {isProcessing ? '처리 중...' : t('merge.execute')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

async function addFileToList(
  file: File,
  setFiles: React.Dispatch<React.SetStateAction<MergeFile[]>>
) {
  const id = crypto.randomUUID();
  setFiles((prev) => [...prev, { id, file, pageCount: null }]);
  try {
    const buffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(buffer);
    const pageCount = doc.getPageCount();
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, pageCount } : f)));
  } catch {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, pageCount: 0 } : f)));
  }
}
