import { useRef } from 'react';
import { useRegistry } from '@embedpdf/core/react';
import { useOpenDocuments, useDocumentManagerCapability } from '@embedpdf/plugin-document-manager/react';
import { X, FileText } from 'lucide-react';

export function TabBar() {
  const { activeDocumentId } = useRegistry();
  const openDocs = useOpenDocuments();
  const { provides: docManager } = useDocumentManagerCapability();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (openDocs.length === 0) return null;

  const handleClose = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    docManager?.closeDocument(docId).wait(
      () => {},
      (err) => console.error('[TabBar] closeDocument error:', err)
    );
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex h-9 shrink-0 items-end overflow-x-auto border-b border-border bg-surface scrollbar-none"
      onWheel={handleWheel}
    >
      {openDocs.map((doc) => {
        const isActive = doc.id === activeDocumentId;
        const displayName = doc.name
          ? doc.name.replace(/\.pdf$/i, '')
          : 'Untitled';

        return (
          <button
            key={doc.id}
            className={`group relative flex h-8 min-w-0 max-w-[200px] shrink-0 items-center gap-1.5 border-r border-border px-3 text-xs transition-colors ${
              isActive
                ? 'bg-surface-alt font-medium text-text after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary'
                : 'text-text-muted hover:bg-surface-alt/60 hover:text-text'
            }`}
            onClick={() => !isActive && docManager?.setActiveDocument(doc.id)}
            title={doc.name ?? 'Untitled'}
          >
            <FileText size={12} className="shrink-0 opacity-60" />
            <span className="min-w-0 flex-1 truncate">{displayName}</span>
            <span
              className={`flex shrink-0 items-center justify-center rounded p-0.5 transition-colors hover:bg-border hover:text-text ${
                isActive ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'
              }`}
              onClick={(e) => handleClose(e, doc.id)}
              title="닫기"
            >
              <X size={11} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
