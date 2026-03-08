import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Scissors } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { parsePageRanges, downloadFile } from './utils';

interface SplitDialogProps {
  open: boolean;
  onClose: () => void;
  /** The raw PDF bytes of the currently open document */
  pdfBytes: Uint8Array | null;
  /** Original file name (without extension) */
  baseName: string;
  totalPages: number;
}

export function SplitDialog({
  open,
  onClose,
  pdfBytes,
  baseName,
  totalPages,
}: SplitDialogProps) {
  const { t } = useTranslation();
  const [rangeInput, setRangeInput] = useState('');
  const [outputName, setOutputName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<number[] | null>(null);

  useEffect(() => {
    if (open) {
      setRangeInput('');
      setOutputName(baseName);
      setError(null);
      setPreview(null);
    }
  }, [open, baseName]);

  const validateAndPreview = useCallback(
    (value: string) => {
      setRangeInput(value);
      if (!value.trim()) {
        setPreview(null);
        setError(null);
        return;
      }
      const indices = parsePageRanges(value, totalPages);
      if (!indices) {
        setError(`유효하지 않은 범위입니다. 1~${totalPages} 사이의 숫자를 입력하세요.`);
        setPreview(null);
      } else {
        setError(null);
        setPreview(indices);
      }
    },
    [totalPages]
  );

  const handleSplit = useCallback(async () => {
    if (!pdfBytes || !preview || preview.length === 0) return;
    setIsProcessing(true);
    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(srcDoc, preview);
      copied.forEach((page) => newDoc.addPage(page));
      const outBytes = await newDoc.save();
      const fileName = `${outputName || baseName}_split.pdf`;
      downloadFile(outBytes, fileName);
      onClose();
    } catch (err) {
      setError('PDF 분할 중 오류가 발생했습니다: ' + String(err));
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, preview, outputName, baseName, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-[480px] rounded-lg border border-border bg-surface shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-text">
            <Scissors size={16} className="text-primary" />
            {t('split.title')}
          </div>
          <button
            className="rounded p-1 text-text-muted hover:bg-surface-alt"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-4">
          {/* Info */}
          <p className="text-sm text-text-muted">
            전체 {totalPages}페이지 중 추출할 범위를 입력하세요.
          </p>

          {/* Range input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">
              {t('split.rangeLabel')}
            </label>
            <input
              className={`rounded border px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                error ? 'border-red-500 bg-red-50' : 'border-border bg-surface'
              }`}
              placeholder={t('split.rangePlaceholder')}
              value={rangeInput}
              onChange={(e) => validateAndPreview(e.target.value)}
              autoFocus
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            {preview && (
              <p className="text-xs text-text-muted">
                선택된 페이지 {preview.length}장:{' '}
                {preview.map((i) => i + 1).join(', ')}
              </p>
            )}
          </div>

          {/* Output file name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">
              {t('split.outputName')}
            </label>
            <input
              className="rounded border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
            />
          </div>

          {/* Page grid preview */}
          {preview && preview.length > 0 && (
            <div className="flex flex-wrap gap-1.5 rounded border border-border bg-surface-alt p-2">
              {Array.from({ length: Math.min(totalPages, 50) }, (_, i) => (
                <span
                  key={i}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-medium ${
                    preview.includes(i)
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-muted'
                  }`}
                >
                  {i + 1}
                </span>
              ))}
              {totalPages > 50 && (
                <span className="text-xs text-text-muted">+{totalPages - 50}...</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
          <button
            className="rounded px-4 py-2 text-sm text-text-muted hover:bg-surface-alt"
            onClick={onClose}
          >
            {t('dialog.cancel')}
          </button>
          <button
            className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
            onClick={handleSplit}
            disabled={!preview || preview.length === 0 || isProcessing || !pdfBytes}
          >
            <Scissors size={14} />
            {isProcessing ? '처리 중...' : t('split.execute')}
          </button>
        </div>
      </div>
    </div>
  );
}
